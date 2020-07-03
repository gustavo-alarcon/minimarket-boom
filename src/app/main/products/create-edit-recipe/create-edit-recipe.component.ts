import { Component, OnInit, ViewChild, Inject, Renderer2 } from '@angular/core';
import { Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { map, tap, filter, startWith, distinctUntilChanged } from 'rxjs/operators';
import {COMMA, ENTER} from '@angular/cdk/keycodes';

import { DatabaseService } from 'src/app/core/services/database.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';

import { Recipe } from 'src/app/core/models/recipe.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from 'src/app/core/models/product.model';
import { User } from 'src/app/core/models/user.model';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-create-edit-recipe',
  templateUrl: './create-edit-recipe.component.html',
  styleUrls: ['./create-edit-recipe.component.scss']
})
export class CreateEditRecipeComponent implements OnInit {
  //Variables
  nameFormatting$: Observable<any>;
  productsList$: Observable<Product[]>
  productsListAutocomplete$: Observable<Product[]>;

  recipeForm: FormGroup;
  inputsFormGroup: FormGroup;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  productsObservable$: Observable<number[]>;

  constructor(
    private dialogRef: MatDialogRef<CreateEditRecipeComponent>,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    private renderer: Renderer2,
    @Inject(MAT_DIALOG_DATA) public data: { data: Recipe, edit: boolean }
  ) { }

  ngOnInit() {
    this.initForms();
    this.initObservables();
  }

  initForms(){
    if (this.data.edit) {
      this.inputsFormGroup = this.fb.group({
        textInput: [''],
        product: [this.data.data.products, this.recipe2ProductsValidator()]
      })
      this.recipeForm = this.fb.group({
        name: this.fb.control(this.data.data.name, {
          validators: [Validators.required],
          asyncValidators: this.recipeNameRepeatedValidator(this.dbs, this.data),
          updateOn: 'blur'
        }),
        description: [this.data.data.description, Validators.required],
        addInputs: [null, this.recipe2InputsValidator()],
        inputs: [this.data.data.inputs],
        videoURL: [this.data.data.videoURL],
      })
    }
    else {
      this.inputsFormGroup = this.fb.group({
        textInput: [''],
        product: [[], this.recipe2ProductsValidator()]
      })
      this.recipeForm = this.fb.group({
        name: this.fb.control(null, {
          validators: [Validators.required],
          asyncValidators: this.recipeNameRepeatedValidator(this.dbs, this.data),
          updateOn: 'blur'
        }),
        description: [null, Validators.required],
        addInputs: [null, this.recipe2InputsValidator()],
        inputs: [[]],
        videoURL: [null],
      })
    }
  }

  initObservables(){
    this.nameFormatting$ = this.recipeForm.get('name').valueChanges.pipe(
      distinctUntilChanged(),
      filter((desc: string) => {
        return /(\S*\s)\s+/g.test(desc);
      }),
      tap((desc: string) => {
        this.recipeForm.get('name').setValue(
          desc.trim().replace(/(\S*\s)\s+/g, '$1')
        )
      }))

    this.productsList$ = this.dbs.getProductsListValueChanges();

    this.productsListAutocomplete$ = combineLatest(
      this.inputsFormGroup.get('textInput').valueChanges.pipe(startWith('')), 
      this.productsList$
      ).pipe(map(([formValue, products]) => {
        let filter = products.filter(el => el.description.match(new RegExp(formValue,'ig')));
        return filter;
      }))
  }

  //Text input
  onAddInput(){
    let inputList = <string[]>this.recipeForm.get('inputs').value;
    inputList.unshift(this.recipeForm.get('addInputs').value);
    this.recipeForm.get('inputs').setValue(inputList);
    this.recipeForm.get('addInputs').setValue("");
  }

  onRemoveInput(input: string){
    let inputList = (<string[]>this.recipeForm.get('inputs').value).filter(el => el != input);
    this.recipeForm.get('inputs').setValue(inputList);
    this.recipeForm.get('addInputs').updateValueAndValidity();
  }
 
  //matChip
  onRemoveProduct(product: Product){
    let removedList = (<Product[]>this.inputsFormGroup.get('product').value).filter(
      el => el.id != product.id
    )
    this.inputsFormGroup.get('product').setValue(removedList)
  }

  onAddProduct(auto: MatAutocomplete, event: MatChipInputEvent){
    let options = auto.options;
    if(options.length){
      //(options.first.value);
      this.onSelectProduct(options.first.value)
    }
    event.input.value = "";
  }

  onSelectProduct(product: Product){
    let initList = (<Product[]>this.inputsFormGroup.get('product').value);
    if(!initList.find(el => el.id == product.id)){
      initList.unshift(product)
      this.inputsFormGroup.get('product').setValue(initList);
    }
    this.inputsFormGroup.get('textInput').setValue("");
  }

  recipe2InputsValidator(){
    return (control: AbstractControl): {'recipe2InputsValidator': boolean} => {
      if(control){
        if(control.parent){
          let inputs = <string[]>control.parent.get('inputs').value;
          if(inputs.length<2){
            return {recipe2InputsValidator: true}
          }
        }
      }
      return null
    }
  }

  recipe2ProductsValidator(){
    return (control: AbstractControl): {'recipe2ProductsValidator': boolean} => {
      if(control){
        let products = <Product[]>control.value;
        //console.log(products);
        if(!products.length){
          return {recipe2ProductsValidator: true}
        }
      }
      return null
    }
  }

  deb(){
    //console.log(this.recipeForm);
    //console.log(this.inputsFormGroup);
  }

  displayFn(input: Product) {
    if (!input) return '';
    return input.description;
  }

  onSubmit(user: User){
    this.recipeForm.markAsPending();

    let recipe: Recipe = {
      id: this.data.edit ? this.data.data.id : null,
      name: this.recipeForm.get('name').value.trim(),
      description: this.recipeForm.get('description').value,
      productsId: (<Product[]>this.inputsFormGroup.get('product').value).map(el => el.id),
      products: this.inputsFormGroup.get('product').value,
      inputs: this.recipeForm.get('inputs').value,
      videoURL: this.recipeForm.get('videoURL').value,
      createdAt: this.data.edit ? this.data.data.createdAt : new Date(),
      createdBy: this.data.edit ? this.data.data.createdBy : user,
      editedAt: this.data.edit ? new Date() : null,
      editedBy: this.data.edit ? user : null,
    }

    this.dbs.createEditRecipe(recipe, this.data.edit)
      .commit().then(
        res => {      
          this.dialogRef.close(true);
        },
        err => {
          this.dialogRef.close(false);
        })
      
  }

  recipeNameRepeatedValidator(dbs: DatabaseService, data: {data: Recipe, edit: boolean}){
    return (control: AbstractControl): Observable<{'nameRepeatedValidator': boolean}> => {
      const value = control.value.toUpperCase();
      if(data.edit){
        if(data.data.name.toUpperCase() == value){
          return of(null)
        }
        else{
          return dbs.getRecipes().pipe(
            map(res => !!res.find(el => el.name.toUpperCase() == value)  ? {nameRepeatedValidator: true} : null),)
          }
        }
      else{
        return dbs.getRecipes().pipe(
          map(res => !!res.find(el => el.name.toUpperCase() == value)  ? {nameRepeatedValidator: true} : null),)
        }
    }
  }
}
