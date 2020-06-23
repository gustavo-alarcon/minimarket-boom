import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { Observable, BehaviorSubject, merge, combineLatest } from 'rxjs';
import { Sale, SaleRequestedProducts, saleStatusOptions } from 'src/app/core/models/sale.model';
import { DatabaseService } from 'src/app/core/services/database.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { startWith, map, tap } from 'rxjs/operators';
import { Product } from 'src/app/core/models/product.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-sales-detail',
  templateUrl: './sales-detail.component.html',
  styleUrls: ['./sales-detail.component.scss']
})
export class SalesDetailComponent implements OnInit {
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
    public auth: AuthService
  ) { }

  ngOnInit() {
    console.log(this.sale)
    this.initForm()
    this.initObservables()
  }

  initForm(){
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
      desiredDate: [this.getDateFromDB(this.sale.requestDate)],
      assignedDate: [
        (this.sale.status == this.saleStatusOptions.requested || 
        this.sale.status == this.saleStatusOptions.attended) ? null :
        this.getDateFromDB(this.sale.confirmedRequestData.assignedDate)],
      observation: [
        (this.sale.status == this.saleStatusOptions.requested || 
        this.sale.status == this.saleStatusOptions.attended) ? null :
        this.sale.confirmedRequestData.observation],
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

  onSubmitForm(newStatus: Sale['status'], user: User){
    console.log('submitting')
    console.log(this.loading$.next(true));
    let date = new Date()
    this.productForm.markAsPending();

    // let sale: Sale = {
    //   id: this.sale.id,
    //   correlative: this.sale.correlative,
    //   correlativeType: this.sale.correlativeType,
    //   payType: this.sale.payType ? this.sale.payType : null,
    //   document: this.sale.document ? this.sale.document : null,
    //   location: this.sale.location,
    //   userId: this.sale.userId ? this.sale.userId : null,
    //   user: this.sale.user,
    //   requestDate: this.sale.requestDate,
    //   createdAt: this.sale.createdAt,
    //   createdBy: this.sale.createdBy,
    //   editedAt: this.sale.editedAt ? this.sale.editedAt : null,
    //   editedBy: this.sale.editedBy ? this.sale.editedBy : null,
    //   deliveryPrice: this.productForm.get('deliveryPrice').value,
    //   total: this.productForm.get('totalPrice').value,
    //   requestedProducts: [],
    //   status: newStatus,
    //   voucher: this.sale.voucher, //I will see voucher at the end
    //   voucherChecked: this.sale.voucherChecked //I will see voucher at the end
    // };

    let sale: Sale = {
      ...this.sale,
      status: newStatus,
      deliveryPrice: this.productForm.get('deliveryPrice').value,
      total: this.productForm.get('totalPrice').value,
      requestedProducts: [],
    //  voucher: this.sale.voucher, //I will see voucher at the end
    //  voucherChecked: this.sale.voucherChecked //I will see voucher at the end
    };

    (<FormArray>this.productForm.get('productList')).controls.forEach(formGroup => {
      //If product quantity is 0, we don't need to save it again
      if(formGroup.get('quantity').value){
        sale.requestedProducts.push({
          quantity: formGroup.get('quantity').value,
          product: formGroup.get('product').value
        });
      }
    });

    if(newStatus == this.saleStatusOptions.confirmedDelivery){
      //sale.confirmedDeliveryData= INCLUIDO
    } else{
      //Confirmed Document
      sale.confirmedDeliveryData= null
      if(newStatus == this.saleStatusOptions.confirmedDocument){
        //sale.confirmedDocumentData= INCLUIDO
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

    this.dbs.onSaveSale(sale).subscribe(
      batch => {
        batch.commit().then(
          res => {
            this.snackBar.open('El pedido fue editado satisfactoriamente', 'Aceptar');
            this.detailSubject.next(null);
          },
          err=> {
            this.snackBar.open('Ocurrió un error. Vuelva a intentarlo', 'Aceptar');
            this.productForm.updateValueAndValidity()
          }
        )},
      err => {
            this.snackBar.open('Ocurrió un error. Vuelva a intentarlo', 'Aceptar');
            this.productForm.updateValueAndValidity()
      }
    )

  }

  

  onCancelSale(user){
    console.log('cancelling')
    /*this.productForm.markAsPending();
    let sale: Sale = {...this.sale}

    this.dbs.onSaveSale(sale, 'Cancelar').subscribe(
      batch => {
        batch.commit().then(
          res => {
            this.snackBar.open('El pedido fue cancelado satisfactoriamente', 'Aceptar');
            this.detailSubject.next(null);
          },
          err=> {
            this.snackBar.open('Ocurrió un error. Vuelva a intentarlo', 'Aceptar');
            this.productForm.updateValueAndValidity()
          }
        )},
      err => {
            this.snackBar.open('Ocurrió un error. Vuelva a intentarlo', 'Aceptar');
            this.productForm.updateValueAndValidity()
      }
    )*/
  }

  onEditSale(pastStatus: Sale['status'], user: User){
    switch(pastStatus){
      case this.saleStatusOptions.attended:
        this.detailSubject.next({
          ...this.sale,
          status: this.saleStatusOptions.requested
        })
        break;
      case this.saleStatusOptions.confirmedRequest:
        this.detailSubject.next({
          ...this.sale,
          status: this.saleStatusOptions.attended
        })
        break;
      case this.saleStatusOptions.confirmedDocument:
        this.detailSubject.next({
          ...this.sale,
          status: this.saleStatusOptions.confirmedRequest
        })
        break;
      case this.saleStatusOptions.confirmedDelivery:
        this.detailSubject.next({
          ...this.sale,
          status: this.saleStatusOptions.confirmedDocument
        })
        break;
      //WE HAVE TO CHECK WHAT SHOULD HAPPEND WITH DRIVER!!!!!
      //WE HAVE TO CHECK WHAT SHOULD HAPPEND WITH DRIVER!!!!!
      //WE HAVE TO CHECK WHAT SHOULD HAPPEND WITH DRIVER!!!!!
      //WE HAVE TO CHECK WHAT SHOULD HAPPEND WITH DRIVER!!!!!
      case this.saleStatusOptions.driverAssigned:
        this.detailSubject.next({
          ...this.sale,
          status: this.saleStatusOptions.confirmedDelivery
        })
        break;
      case this.saleStatusOptions.finished:
        this.detailSubject.next({
          ...this.sale,
          status: this.saleStatusOptions.driverAssigned
        })
        break;
    }
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
