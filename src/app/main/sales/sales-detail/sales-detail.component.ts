import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, merge, combineLatest } from 'rxjs';
import { Sale, SaleRequestedProducts } from 'src/app/core/models/sale.model';
import { DatabaseService } from 'src/app/core/services/database.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { startWith, map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-sales-detail',
  templateUrl: './sales-detail.component.html',
  styleUrls: ['./sales-detail.component.scss']
})
export class SalesDetailComponent implements OnInit {
  productForm: FormGroup;
  totalPrice$: Observable<number[]>
  individualPrice$: Observable<any>

  @Input() sale: Sale
  @Input() detailSubject: BehaviorSubject<Sale>

  
  constructor(
    private fb: FormBuilder,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    
    this.initForm()
    this.initObservables()
  }

  initForm(){
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
  }

  initObservables(){
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
          if(res.ref){
            //ref and promo
            if(res.promo){
              let promRefTotalQuantity = Math.floor(res.quantity/res.product.product.promoData.quantity);
              let promRefTotalPrice = promRefTotalQuantity * res.product.product.promoData.promoPrice;
              let noPromNoRefTotalQuantity = res.quantity % res.product.product.promoData.quantity ? 
                                              res.noRefQuantity : 0;
              let noPromNoRefTotalPrice = noPromNoRefTotalQuantity * res.product.product.price;
              
              //updating Price
              (<FormArray>this.productForm.get('productList')).controls[res.index].get('price')
              .setValue(promRefTotalPrice + noPromNoRefTotalPrice)
            }
            //ref no promo
            else{
              (<FormArray>this.productForm.get('productList')).controls[res.index].get('price')
              .setValue(res.quantity ?  res.noRefQuantity * res.product.product.price : 0)
            }
          }
          else{
            //no ref, promo
            if(res.promo){
              let promTotalQuantity = Math.floor(res.quantity/res.product.product.promoData.quantity);
              let promTotalPrice = promTotalQuantity * res.product.product.promoData.promoPrice;
              let noPromTotalQuantity = res.quantity % res.product.product.promoData.quantity;
              let noPromTotalPrice = noPromTotalQuantity * res.product.product.price;
              
              //updating Price
              (<FormArray>this.productForm.get('productList')).controls[res.index].get('price')
              .setValue(promTotalPrice + noPromTotalPrice)
            }
            //no ref no promo
            else{
              (<FormArray>this.productForm.get('productList')).controls[res.index].get('price')
              .setValue(res.quantity * res.product.product.price)
            }
          }
        })
      );

    //Calculating total Price
    this.totalPrice$ = combineLatest(...(<FormArray>this.productForm.get('productList')).controls
      .map((control, index) => (
        (<FormGroup>control).get('price').valueChanges.pipe(startWith(
          this.sale.totalConfirmedPrice?this.sale.confirmedProductList[index]['price']:this.giveProductPrice(this.sale.productList[index])
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

  ngOnDetroy(){
  }

  onSubmitForm(){
    this.productForm.markAsPending();
    let sale: Sale = {...this.sale}
    sale.deliveryConfirmedPrice = this.productForm.get('deliveryPrice').value;
    sale.totalConfirmedPrice = this.productForm.get('totalPrice').value;
    sale.confirmedProductList = [];
    (<FormArray>this.productForm.get('productList')).controls.forEach(formGroup => {
      sale.confirmedProductList.push({
        noRefQuantity: formGroup.get('noRefQuantity').value,
        price: formGroup.get('price').value,
        quantity: formGroup.get('quantity').value,
        product: formGroup.get('product').value
      });
    });

    /*this.dbs.onSaveSale(sale, 'Confirmar').subscribe(
      batch => {
        batch.commit().then(
          res => {
            this.snackBar.open('El pedido fue confirmado satisfactoriamente', 'Aceptar');
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

  getNoRefQuantity(item: SaleRequestedProducts): number{
    //only ref, no promo
    if(!item.product.promo){
      return Math.floor(this.giveProductPrice(item)/Number(item.product.price)*100.0)/100.0
    }
    //ref with promo
    else{
      let noPromRefTotalQuantity = item.quantity % item.product.promoData.quantity;
      let noPromRefTotalPrice = noPromRefTotalQuantity * item.product.refPrice;
      let noPromNoRefTotalPrice = Math.floor(noPromRefTotalPrice / item.product.price*100.0)/100.0;
      return noPromNoRefTotalPrice;
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

  onCancelSale(){
    this.productForm.markAsPending();
    let sale: Sale = {...this.sale}

    /*this.dbs.onSaveSale(sale, 'Cancelar').subscribe(
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
  onFloor(el: number, el2: number): number{
    return Math.floor(el/el2);
  }

}
