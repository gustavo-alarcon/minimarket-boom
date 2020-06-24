import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { Observable, BehaviorSubject, merge, combineLatest, iif, of, throwError, empty } from 'rxjs';
import { Sale, SaleRequestedProducts, saleStatusOptions } from 'src/app/core/models/sale.model';
import { DatabaseService } from 'src/app/core/services/database.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { startWith, map, tap, take, switchMap } from 'rxjs/operators';
import { Product } from 'src/app/core/models/product.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/core/models/user.model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-sales-detail',
  templateUrl: './sales-detail.component.html',
  styleUrls: ['./sales-detail.component.scss']
})
export class SalesDetailComponent implements OnInit {
  now: Date = new Date();

  loading$: BehaviorSubject<boolean> = new BehaviorSubject(false)

  productForm: FormGroup;
  confirmedRequestForm: FormGroup;
  confirmedDocumentForm: FormGroup;
  confirmedDeliveryForm: FormGroup;

  searchProductControl: FormControl;

  products$: Observable<Product[]>
  totalPrice$: Observable<number[]>
  individualPrice$: Observable<any>

  @Input() sale: Sale
  @Input() detailSubject: BehaviorSubject<Sale>

  saleStatusOptions = new saleStatusOptions();
  
  constructor(
    private fb: FormBuilder,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    public auth: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    console.log(this.sale)
    this.initForm()
    this.initObservables()
  }

  initForm(){
    this.now = new Date(this.now.valueOf() + 345600000)
    this.searchProductControl = new FormControl("")
    this.productForm = this.fb.group({
      deliveryPrice: [this.sale.deliveryPrice, Validators.required],
      totalPrice: [0, Validators.required],
      productList: this.fb.array([])
    });

    this.sale.requestedProducts.forEach((product, index) => {
      (<FormArray>this.productForm.get('productList')).insert(index, 
        this.fb.group({
          product: [product.product, Validators.required],
          quantity: [product.quantity, Validators.required],
          price: [this.giveProductPrice(product), Validators.required],

          //When we have promo
          promoQuantity: [product.product.promo ? product.product.promoData.quantity : null],
          promoPrice: [product.product.promo ? product.product.promoData.promoPrice : null]
        })
        )
    })

    this.confirmedRequestForm = this.fb.group({
      // desiredDate: [this.getDateFromDB(this.sale.requestDate)],
      assignedDate: [
        !this.sale.confirmedRequestData ? null :
        this.getDateFromDB(this.sale.confirmedRequestData.assignedDate)],
      observation: [
        !this.sale.confirmedRequestData ? null :
        this.sale.confirmedRequestData.observation],
    })

    this.confirmedDocumentForm = this.fb.group({
      document: [this.sale.document],
      documentNumber: [
        !this.sale.confirmedDocumentData ? null : 
        this.sale.confirmedDocumentData.documentNumber
      ]
    })

    this.confirmedDeliveryForm = this.fb.group({
      deliveryType: [
        !this.sale.confirmedDeliveryData ? false : 
        this.sale.confirmedDeliveryData.deliveryType == "Biker" ?
        false : true
      ],
      deliveryBusiness: [
        !this.sale.confirmedDeliveryData ? null : 
        this.sale.confirmedDeliveryData.deliveryBusiness
      ],
    })
  }

  //initRequestConfirmed

  getDateFromDB(date: Date){
    let parsedDate = new Date(1970);
    parsedDate.setSeconds(date['seconds'])
    return parsedDate
  }

  initObservables(){
    //Search Product
    this.products$ = combineLatest(
      this.searchProductControl.valueChanges.pipe(startWith("")),
      this.dbs.getProductsListValueChanges()).pipe(
        map(([formValue, products])=> {
          if(typeof formValue === 'string'){
            return products.filter(el => el.description.match(new RegExp(formValue, 'ig')))
          } else {
            return []
          }
        })
      )
    //Changing individual price when changing quantities
    this.individualPrice$ = merge(...(<FormArray>this.productForm.get('productList')).controls
      .map((control, index) => {

        //with prom
        if(this.sale.requestedProducts[index].product.promo){
          return (<FormGroup>control).get('quantity').valueChanges.pipe(
            map(quantity => {
              return {
                product: this.sale.requestedProducts[index],
                quantity,
                promo: true,
                index
              }})
          )
        }
        //no prom
        else{
          return (<FormGroup>control).get('quantity').valueChanges.pipe(
            map(quantity => {
              return {
                product: this.sale.requestedProducts[index],
                quantity,
                promo: false,
                index
              }})
          )
        }
      }))
      .pipe(
        tap((res: {product: SaleRequestedProducts, quantity: number, noRefQuantity: number, 
                    promo: boolean, ref: boolean, index: number}) => {

          //with promo
          if(res.promo){
            let promTotalQuantity = Math.floor(res.quantity/res.product.product.promoData.quantity);
            let promTotalPrice = promTotalQuantity * res.product.product.promoData.promoPrice;
            let noPromTotalQuantity = res.quantity % res.product.product.promoData.quantity;
            let noPromTotalPrice = noPromTotalQuantity * res.product.product.price;
            
            //updating Price
            (<FormArray>this.productForm.get('productList')).controls[res.index].get('price')
            .setValue(promTotalPrice + noPromTotalPrice)
          }
          //no promo
          else{
            (<FormArray>this.productForm.get('productList')).controls[res.index].get('price')
            .setValue(res.quantity * res.product.product.price)
          }
        })
      );

    //Calculating total Price
    this.totalPrice$ = combineLatest(...(<FormArray>this.productForm.get('productList')).controls
      .map((control, index) => (
        (<FormGroup>control).get('price').valueChanges.pipe(startWith(
          this.giveProductPrice(this.sale.requestedProducts[index])
          )))))
      .pipe(
        tap((priceList: number[]) => {
          let totalPrice = priceList.reduce((acc, curr)=>{
            return curr ? (curr + acc) : (0 + acc)
          },0)
          this.productForm.get('totalPrice').setValue(totalPrice);
        })
      );
  }

  //newStatus will work as an old status when we edit (deshacer)
  //edit=true for deschacer
  onSubmitForm(newStatus: Sale['status'], user: User, edit?: boolean){
    this.loading$.next(true);
    let downNewStatus = edit ? this.onEditSaleGetNewStatus(newStatus, user) : null;
    let sale = edit ? this.onGetUpdatedSale(downNewStatus,user) : this.onGetUpdatedSale(newStatus,user);

    of(!!edit).pipe(
      switchMap(edit => {
        if(!edit){
          return this.upgradeConfirmation(newStatus)
        } else {
          return this.downgradeConfirmation(downNewStatus)
        }
      }),
      switchMap(answer => iif(
        //condition
        () => {return answer.action =="confirm"},
        //confirmed
        this.dbs.onSaveSale(sale).pipe(
          switchMap(
            batch => {
              //If we are editting it (deshacer), and we are returning from
              //confirmedDelivery to confirmedDocument, we should refill the 
              //lost stock
              if(edit){
                if(downNewStatus == this.saleStatusOptions.confirmedDocument &&
                    newStatus != this.saleStatusOptions.cancelled){
                  this.onUpdateStock(this.getSaleRequestedProducts(), batch, false)
                } else {
                  //If we are returning fron cancelled to any of the ones bellow,
                  //We should take out from stock
                  if( newStatus == this.saleStatusOptions.cancelled &&
                    ( downNewStatus == this.saleStatusOptions.confirmedDelivery ||
                      downNewStatus == this.saleStatusOptions.driverAssigned ||
                      downNewStatus == this.saleStatusOptions.finished)
                    ){
                      //Recall that when we edit (deshacer) newStatus will work as the past status
                      this.onUpdateStock(this.getSaleRequestedProducts(), batch, true)
                    }
                }
              } else {
                //WE are note editting, but we are confirming delivery, so we
                //should take out stock
                if(newStatus == this.saleStatusOptions.confirmedDelivery){
                  this.onUpdateStock(this.getSaleRequestedProducts(), batch, true)
                } else {
                  if(newStatus == this.saleStatusOptions.cancelled){
                    this.onUpdateStock(this.getSaleRequestedProducts(), batch, false)
                  }
                }
              }
              return batch.commit().then(
                res => {
                  this.snackBar.open('El pedido fue editado satisfactoriamente', 'Aceptar');
                  this.detailSubject.next(sale);
                },
                err=> {
                  throwError(err)
                }
              )
            }
          )
        ),
        //dismissed
        empty()
        )
      )
    ).subscribe(
      () => {
        this.loading$.next(false)
      },
      err => {
        console.log(err);
        this.snackBar.open('Ocurrió un error. Vuelva a intentarlo.', 'Aceptar');
        this.loading$.next(false);
      },
      () => {
        this.loading$.next(false)
      }
    )
  }

  onEditSaleGetNewStatus(pastStatus: Sale['status'], user: User): Sale['status']{
    switch(pastStatus){
      case this.saleStatusOptions.attended:
          return  this.saleStatusOptions.requested
      case this.saleStatusOptions.confirmedRequest:
          return  this.saleStatusOptions.attended
      case this.saleStatusOptions.confirmedDocument:
          return  this.saleStatusOptions.confirmedRequest
      case this.saleStatusOptions.confirmedDelivery:
        //we should refill stock here
          return  this.saleStatusOptions.confirmedDocument
      //If it is in finished or driverAssigned state,
      //we return it to confirmedDelivery
      case this.saleStatusOptions.driverAssigned:
          return  this.saleStatusOptions.confirmedDocument
      case this.saleStatusOptions.finished:
          return  this.saleStatusOptions.confirmedDocument
      case this.saleStatusOptions.cancelled:
        //We don't include a finished data, 
        //because a finished sale can not be cancelled
        if(this.sale.finishedData){
          return this.saleStatusOptions.finished
        } else {
          if(this.sale.driverAssignedData){
              return  this.saleStatusOptions.driverAssigned
          } else {
            if(this.sale.confirmedDeliveryData){
                return  this.saleStatusOptions.confirmedDelivery
            } else {
              if(this.sale.confirmedDocumentData){
                  return  this.saleStatusOptions.confirmedDocument
              } else {
                if(this.sale.confirmedRequestData){
                    return  this.saleStatusOptions.confirmedRequest
                } else {
                  if(this.sale.attendedData){
                      return  this.saleStatusOptions.attended
                  } else {
                      return  this.saleStatusOptions.requested
                  }
                }
              }
            }
          }
        }

    }
  }

  downgradeConfirmation(newStatus: Sale['status']): 
  Observable<{action: string, lastObservation: string}>{
    let dialogRef: MatDialogRef<ConfirmationDialogComponent>;

    if(newStatus == this.saleStatusOptions.confirmedDelivery){
      dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        closeOnNavigation: false,
        disableClose: true,
        width: '360px',
        maxWidth: '360px',      
        data: {
        warning: `La solicitud será editada.`,
        content: `¿Está seguro de regresar la solicitud al estado <b>'${newStatus}'</b>?
          Con esta acción, se reestablecerá el stock correspondiente.`,
        noObservation: true,
        observation: null,
        title: 'Deshacer',
        titleIcon: 'warning'
        }
      })
    } else {
      dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        closeOnNavigation: false,
        disableClose: true,
        width: '360px',
        maxWidth: '360px',      
        data: {
        warning: `La solicitud será editada.`,
        content: `¿Está seguro de regresar la solicitud al estado <b>'${newStatus}'</b>?`,
        noObservation: true,
        observation: null,
        title: 'Deshacer',
        titleIcon: 'warning'
        }
      })
    }

    return dialogRef.afterClosed().pipe(take(1))
  }

  upgradeConfirmation(newStatus: Sale['status']): 
  Observable<{action: string, lastObservation: string}>{
    let dialogRef: MatDialogRef<ConfirmationDialogComponent>;

    if(newStatus == this.saleStatusOptions.confirmedDelivery){
      dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        closeOnNavigation: false,
        disableClose: true,
        width: '360px',
        maxWidth: '360px',      
        data: {
        warning: `La solicitud será actualizada.`,
        content: `¿Está seguro de actualizar la solicitud al estado <b>'${newStatus}'</b>?
          Con esta acción, se descontará el stock correspondiente.`,
        noObservation: true,
        observation: null,
        title: 'Actualizar',
        titleIcon: 'warning'
        }
      })
    } else { 
      if(newStatus == this.saleStatusOptions.cancelled){
        dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          closeOnNavigation: false,
          disableClose: true,
          width: '360px',
          maxWidth: '360px',      
          data: {
          warning: `La solicitud será anulada.`,
          content: `¿Está seguro de <b>cancelar</b> la solicitud? Si la solicitud
          se encuentra en estado 'Delivery Confirmado', 'Conductor Asignado' o 
          'Entregado', se repondrá el stock correspondiente`,
          noObservation: true,
          observation: null,
          title: 'Anular',
          titleIcon: 'warning'
          }
        })
      } else {
        dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          closeOnNavigation: false,
          disableClose: true,
          width: '360px',
          maxWidth: '360px',      
          data: {
          warning: `La solicitud será actualizada.`,
          content: `¿Está seguro de actualizar la solicitud al estado <b>'${newStatus}'</b>?`,
          noObservation: true,
          observation: null,
          title: 'Deshacer',
          titleIcon: 'warning'
          }
        })
      }
    }

    return dialogRef.afterClosed().pipe(take(1))
  }

  onGetUpdatedSale(newStatus: Sale['status'], user: User): Sale{
    let date = new Date()
    this.productForm.markAsPending();

    let sale: Sale = {
      ...this.sale,
      status: newStatus,
      deliveryPrice: this.productForm.get('deliveryPrice').value,
      total: this.productForm.get('totalPrice').value,
      requestedProducts: [],
    //  voucher: this.sale.voucher, //I will see voucher at the end
    //  voucherChecked: this.sale.voucherChecked //I will see voucher at the end
      driverAssignedData: null,
      finishedData: null
    };

    sale.requestedProducts = this.getSaleRequestedProducts();
    if(newStatus == this.saleStatusOptions.cancelled){
      sale.cancelledData = {
        cancelledAt: date,
        cancelledBy: user
      }
    } else {
      sale.cancelledData = null;
      if(newStatus == this.saleStatusOptions.confirmedDelivery){
        sale.confirmedDeliveryData = {
          confirmedAt: date,
          confirmedBy: user,
          deliveryType: this.confirmedDeliveryForm.get("deliveryType").value ? 
                        "Moto" : "Biker",
          deliveryBusiness: this.confirmedDeliveryForm.get("deliveryBusiness").value
        }
      } else{
        //Confirmed Document
        sale.confirmedDeliveryData= null
        if(newStatus == this.saleStatusOptions.confirmedDocument){
          sale.confirmedDocumentData = {
            documentNumber: this.confirmedDocumentForm.get('documentNumber').value,
            confirmedBy: user,
            confirmedAt: date,
          }
        } else {
          //Confirmed Request
          sale.confirmedDocumentData= null
          if(newStatus == this.saleStatusOptions.confirmedRequest){
            sale.confirmedRequestData = {
              assignedDate: this.confirmedRequestForm.get('assignedDate').value,
              requestedProductsId: sale.requestedProducts.map(el => el.product.id),
              observation: this.confirmedRequestForm.get('observation').value,
              confirmedBy: user,
              confirmedAt: date,
            }
          } else {
            //ATTENDED
            sale.confirmedRequestData = null
            if(newStatus == this.saleStatusOptions.attended){
              sale.attendedData = {
                attendedAt: new Date(),
                attendedBy: user
              }
            }
          }
        }
      }
    }
    return sale;
  }

  onUpdateStock(requestedProducts: Sale['requestedProducts'], batch: firebase.firestore.WriteBatch, decrease: boolean){
    this.dbs.onUpdateStock(requestedProducts, batch, decrease)
  }

  getSaleRequestedProducts(): Sale['requestedProducts']{
    let requestedProducts: Sale['requestedProducts'] = [];
    (<FormArray>this.productForm.get('productList')).controls.forEach(formGroup => {
      //If product quantity is 0, we don't need to save it again
      if(formGroup.get('quantity').value){
        requestedProducts.push({
          quantity: formGroup.get('quantity').value,
          product: formGroup.get('product').value
        });
      }
    });
    return requestedProducts
  }

  giveProductPrice(item: SaleRequestedProducts){
    if(item.product.promo){
      let promTotalQuantity = Math.floor(item.quantity/item.product.promoData.quantity);
      let promTotalPrice = promTotalQuantity * item.product.promoData.promoPrice;
      let noPromTotalQuantity = item.quantity % item.product.promoData.quantity;
      let noPromTotalPrice = noPromTotalQuantity * item.product.price;
      return promTotalPrice + noPromTotalPrice;
    }
    else{
      return item.quantity*item.product.price
    }
  }

  givePromoPrice(item: SaleRequestedProducts): number {
    let amount = item['quantity']
    let promo = item['product']['promoData']['quantity']
    let pricePromo = item['product']['promoData']['promoPrice']
    let price = item['product']['price']

    if (amount >= promo) {
      let wp = amount % promo
      let op = Math.floor(amount / promo)
      return wp * price + op * pricePromo
    } else {
      return amount * price
    }
  }

  displayFn(input: Product) {
    if (!input) return '';
    return input.description;
  }
  
  onFloor(el: number, el2: number): number{
    return Math.floor(el/el2);
  }

  getCorrelative(corr: number){
    return corr.toString().padStart(6, '0')
  }
}
