import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DatabaseService } from 'src/app/core/services/database.service';
import { Product } from 'src/app/core/models/product.model';
import { of, Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith, tap, debounceTime, distinctUntilChanged, filter, take } from 'rxjs/operators';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { ProductConfigCategoriesComponent } from '../product-config-categories/product-config-categories.component';
import { User } from 'src/app/core/models/user.model';
import { PackageUnit } from 'src/app/core/models/unit.model';
import { ProductConfigUnitsComponent } from '../product-config-units/product-config-units.component';
import { Package } from 'src/app/core/models/package.model';

@Component({
  selector: 'app-packages-create-edit',
  templateUrl: './packages-create-edit.component.html',
  styleUrls: ['./packages-create-edit.component.scss']
})
export class PackagesCreateEditComponent implements OnInit {
  //Variables
  packageForm: FormGroup;
  dateType: ["Definida", "Indefinida"];
  itemsFormGroup: FormGroup;

  descriptionFormatting$: Observable<string>
  skuFormatting$: Observable<string>
  units$: Observable<PackageUnit[]>
  productsList$: Observable<Product[]>
  productsListAutocomplete$: Observable<Product[]>;

  noImage = '../../../../assets/images/no-image.png';
  separatorKeysCodes: number[] = [ENTER, COMMA];

  photos: {
    resizing$: {
      photoURL: Observable<boolean>,
    },
    data: {
      photoURL: File,
    }
  } = {
      resizing$: {
        photoURL: new BehaviorSubject<boolean>(false),
      },
      data: {
        photoURL: null,
      }
    }


  constructor(
    private dialogRef: MatDialogRef<PackagesCreateEditComponent>,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    private ng2ImgMax: Ng2ImgMaxService,
    @Inject(MAT_DIALOG_DATA) public data: { data: Package, edit: boolean }
  ) { }

  ngOnInit() {
    this.initForm();
    this.initObservables();
  }

  initForm() {
    //console.log(this.data);
    if (this.data.edit) {
      this.itemsFormGroup = this.fb.group({
        textInput: [''],
        product: [this.data.data.items, this.minInputsValidator()]
      })

      this.packageForm = this.fb.group({
        description: this.fb.control(this.data.data.description, {
          validators: [Validators.required],
          asyncValidators: this.descriptionRepeatedValidator(this.dbs, this.data),
          updateOn: 'blur'
        }),
        sku: this.fb.control(this.data.data.sku, {
          validators: [Validators.required],
          asyncValidators: this.skuRepeatedValidator(this.dbs, this.data),
          updateOn: 'blur'
        }),
        unit: [this.data.data.unit, Validators.required],
        price: [this.data.data.price, [Validators.required, Validators.min(0)]],
        dateType: [this.data.data.dateLimit ? this.dateType[0] : this.dateType[1], Validators.required],
        dateLimit: [
          {
            value: this.data.data.dateLimit, 
            disabled: this.data.data.dateLimit ? false : true,
          }, Validators.required],
        totalItems: [this.data.data.totalItems, [Validators.required, Validators.min(1)]],
        additionalDescription:[this.data.data.additionalDescription, Validators.required],
        photoURL: [this.data.data.photoURL, Validators.required],
      })
    }
    else {
      this.itemsFormGroup = this.fb.group({
        textInput: [''],
        product: [[], this.minInputsValidator()]
      })

      this.packageForm = this.fb.group({
        description: this.fb.control(this.data.data.description, {
          validators: [Validators.required],
          asyncValidators: this.descriptionRepeatedValidator(this.dbs, this.data),
          updateOn: 'blur'
        }),
        sku: this.fb.control(this.data.data.sku, {
          validators: [Validators.required],
          asyncValidators: this.skuRepeatedValidator(this.dbs, this.data),
          updateOn: 'blur'
        }),
        unit: [null, Validators.required],
        price: [0, [Validators.required, Validators.min(0)]],
        dateType: [null, Validators.required],
        dateLimit: [
          {
            value: null, 
            disabled: true,
          }, Validators.required],
        totalItems: [null, [Validators.required, Validators.min(1)]],
        additionalDescription:[null, Validators.required],
        photoURL: [null, Validators.required],
      })

    }
  }

  deb(){
    console.log(this.packageForm);
  }

  initObservables() {
    this.descriptionFormatting$ = this.packageForm.get('description').valueChanges.pipe(
      distinctUntilChanged(),
      filter((desc: string) => {
        return /(\S*\s)\s+/g.test(desc);
      }),
      tap((desc: string) => {
        this.packageForm.get('description').setValue(
          desc.trim().replace(/(\S*\s)\s+/g, '$1')
        )
      }))

    this.skuFormatting$ = this.packageForm.get('sku').valueChanges.pipe(
      filter((desc: string) => {
        return /\s+/g.test(desc);
      }),
      tap((desc: string) => {
        //console.log('skuformat')
        this.packageForm.get('sku').setValue(
          desc.match(/\S/g).join("")
        )
      }))

    this.units$ = this.dbs.getProductsListUnitsValueChanges().pipe(
      take(1),
      tap(unit => {
      if(this.data.edit){
        let selectedUnit = unit.find(el => el.description == this.data.data.unit.description);
        this.packageForm.get('unit').setValue(selectedUnit)
      }
    }));
  }

  onAddCategory() {
    this.dialog.open(ProductConfigCategoriesComponent);
  }

  onAddUnit() {
    this.dialog.open(ProductConfigUnitsComponent);
  }

  //Photo
  addNewPhoto(formControlName: string, image: File[]) {
    this.packageForm.get(formControlName).setValue(null);
    if (image.length === 0)
      return;
    //this.tempImage = image[0];
    let reader = new FileReader();

    this.photos.resizing$[formControlName].next(true);
  
    this.ng2ImgMax.resizeImage(image[0], 10000, 426)
      .pipe(
        take(1)
      ).subscribe(
        result => {
          this.photos.data[formControlName] = new File([result], formControlName + result.name.match(/\..*$/));

          reader.readAsDataURL(image[0]);
          reader.onload = (_event) => {
            this.packageForm.get(formControlName).setValue(reader.result);
            this.photos.resizing$[formControlName].next(false);
          }
        },
        error => {
          this.photos.resizing$[formControlName].next(false);
          this.snackBar.open('Por favor, elija una imagen en formato JPG, o PNG', 'Aceptar');
          this.packageForm.get(formControlName).setValue(null);

        }
      );
  }

  onSubmitForm(user: User) {
    this.packageForm.markAsPending();

    let product: Product = {
      id: null,
      description: this.packageForm.get('description').value.trim().toLowerCase(),
      additionalDescription: this.packageForm.get('additionalDescription').value.trim(),
      sku: this.packageForm.get('sku').value,
      category: this.packageForm.get('category').value,
      price: this.packageForm.get('price').value,
      unit: this.packageForm.get('unit').value,
      realStock: this.packageForm.get('realStock').value,
      mermaStock: this.packageForm.get('mermaStock').value,
      sellMinimum: this.packageForm.get('sellMinimum').value,
      alertMinimum: this.packageForm.get('alertMinimum').value,
      photoURL: this.packageForm.get('photoURL').value,
      photoPath: this.data.edit ? this.data.data.photoPath : null,
      promo: this.data.edit ? this.data.data.promo : false,
      promoData: this.data.edit ? this.data.data.promoData : null,
      published: this.data.edit ? this.data.data.published : null,
      createdAt: this.data.edit ? this.data.data.createdAt : new Date(),
      createdBy: this.data.edit ? this.data.data.createdBy : user,
      editedAt: this.data.edit ? new Date() : null,
      editedBy: this.data.edit ? user : null,
    }

    this.dbs.createEditProduct(this.data.edit, product, this.data.data, this.photos.data.photoURL)
      .subscribe(batch => {
        batch.commit().then(res => {      
          this.dialogRef.close(true);
        },
          err => {
            this.dialogRef.close(false);
          })
      },
        err => {
          this.dialogRef.close(false);
        });
  }

  minimumSellValidator(){
    return (control: AbstractControl): {'sellMinimumExceeded': boolean} => {
      if(control.parent){
        if(control.parent.get('sellMinimum').value >= control.parent.get('alertMinimum').value){
            if(control.parent.get('sellMinimum').value && control.parent.get('alertMinimum').value){
              return {'sellMinimumExceeded': true}
            }
            return null
        } else{
          return null
        }
      } else {
        return null
      }
      
    }
  }

  descriptionRepeatedValidator(dbs: DatabaseService, data: {data: Package, edit: boolean}){
    return (control: AbstractControl): Observable<{'descriptionRepeatedValidator': boolean}> => {
      const value = control.value.toUpperCase();
      if(data.edit){
        if(data.data.description.toUpperCase() == value){
          return of(null)
        }
        else{
          return dbs.getProductsList().pipe(
            map(res => !!res.find(el => el.description.toUpperCase() == value)  ? {descriptionRepeatedValidator: true} : null),)
          }
        }
      else{
        return dbs.getProductsList().pipe(
          map(res => !!res.find(el => el.description.toUpperCase() == value)  ? {descriptionRepeatedValidator: true} : null),)
        }
    }
  }

  skuRepeatedValidator(dbs: DatabaseService, data: {data: Package, edit: boolean}){
    return (control: AbstractControl): Observable<{'skuRepeatedValidator': boolean}> => {
      const value = control.value.toUpperCase();
      if(data.edit){
        if(data.data.sku.toUpperCase() == value){
          return of(null)
        }
        else{
          return dbs.getProductsList().pipe(
            map(res => !!res.find(el => el.sku.toUpperCase() == value)  ? {skuRepeatedValidator: true} : null),)
          }
        }
      else{
        return dbs.getProductsList().pipe(
          map(res => !!res.find(el => el.sku.toUpperCase() == value)  ? {skuRepeatedValidator: true} : null),)
        }
    }
  }

  minInputsValidator(){
    return (control: AbstractControl): {'minInputsValidator': boolean} => {
      if(control){
        let products = <Product[]>control.value;
        //console.log(products);
        if(!products.length){
          return {minInputsValidator: true}
        }
      }
      return null
    }
  }

}
