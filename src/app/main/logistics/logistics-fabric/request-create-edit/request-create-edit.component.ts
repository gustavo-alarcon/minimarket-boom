import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { DatabaseService } from 'src/app/core/services/database.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Product } from 'src/app/core/models/product.model';
import { Observable, combineLatest } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { Unit } from 'src/app/core/models/unit.model';
import { User } from 'src/app/core/models/user.model';
import { Buy, BuyRequestedProduct } from 'src/app/core/models/buy.model';

@Component({
  selector: 'app-request-create-edit',
  templateUrl: './request-create-edit.component.html',
  styleUrls: ['./request-create-edit.component.scss']
})
export class RequestCreateEditComponent implements OnInit {
  correlative$: Observable<number>
  selectedProducts: {
    id: string,
    productDescription: string,
    unit: Unit;
    unitPrice: number,
    quantity: number,
    desiredDate: Date,
  }[] = []

  products$: Observable<Product[]>;
  requestFormGroup: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<RequestCreateEditComponent>,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.initObservables();
  }

  initForms(){
    this.requestFormGroup = this.fb.group({
      product: ["", [Validators.required, this.productObjectValidator()]],
      quantity: [0, [Validators.required, Validators.min(0.01)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]],
      desiredDate: [null, Validators.required]
    })
  }

  initObservables(){
    this.correlative$ = this.dbs.getBuysCorrelativeValueChanges();

    this.products$ = combineLatest(
      this.requestFormGroup.get('product').valueChanges.pipe(startWith("")),
      this.dbs.getProductsListValueChanges()).pipe(
        map(([formValue, products])=> {
          if(typeof formValue === 'string'){
            return products.filter(el => el.description.match(new RegExp(formValue, 'ig')))
          } else {
            return []
          }
        })
      )
  }

  deb(){
    console.log(this.selectedProducts);
    console.log(this.requestFormGroup);
  }

  onAddProduct(){
    let product = <Product>this.requestFormGroup.get('product').value
    if(this.selectedProducts.find(el => el.id == product.id)){
      this.snackBar.open("Este producto ya se encuentra en la lista", "Aceptar")
    } else {
      this.selectedProducts.unshift({
        id: product.id,
        desiredDate: this.requestFormGroup.get('desiredDate').value,
        productDescription: product.description,
        quantity: this.requestFormGroup.get('quantity').value,
        unit: product.unit,
        unitPrice: this.requestFormGroup.get('unitPrice').value
      })
    }
    this.requestFormGroup.setValue({
      product: "",
      quantity: 0,
      unitPrice: 0,
      desiredDate: null,
    });
    this.requestFormGroup.markAsUntouched();
  }

  onDeleteProduct(productId: string){
    this.selectedProducts = this.selectedProducts.filter(el => el.id != productId);
  }

  onSubmitForm(user: User){
    console.log('submitting');
    this.requestFormGroup.markAsPending();
    let date = new Date()

    let buy: Buy = {
      id: null,
      correlative: null,
      requestedProducts: this.selectedProducts.map(el => el.id),
      totalAmount: this.selectedProducts.reduce((a,b)=> a + b.quantity*b.unit.weight, 0),
      totalPrice: this.selectedProducts.reduce((a,b)=> a + b.quantity*b.unitPrice, 0),
      validated: false,
      validatedDate: null,
      requestedDate: date,
      requestedBy: user,
    }

    let buyRequestedProducts: BuyRequestedProduct[] = this.selectedProducts.map(el => ({
      id: el.id,
      buyId: null,
      productDescription: el.productDescription,
      unit: el.unit,
      unitPrice: el.unitPrice,
      quantity: el.quantity,
      desiredDate: el.desiredDate,
      validated: false,
      validationData: null,
      validatedBy: null,
      validatedDate: null,
      requestedDate: date,
      requestedBy: user,
    }))

    this.dbs.createEditBuyRequest(buy, buyRequestedProducts, false)
      .commit().then(
        res => {      
          this.dialogRef.close(true);
        },
        err => {
          this.dialogRef.close(false);
        })
  }

  displayFn(input: Product) {
    if (!input) return '';
    return input.description;
  }

  productObjectValidator(){
    return (control: FormControl): {'noProduct': boolean} => {
      if(control){
        if(control.value){
          if(typeof control.value != 'object'){
            return {noProduct: true}
          }
        }
      }
      return null
    }
  }
}
