import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Observable, of, BehaviorSubject, combineLatest } from 'rxjs';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { switchMap, debounceTime, map, tap, filter, startWith, distinctUntilChanged } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { DatabaseService } from 'src/app/core/services/database.service';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Recipe } from 'src/app/core/models/recipe.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from 'src/app/core/models/product.model';
import { User } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-create-edit-recipe',
  templateUrl: './create-edit-recipe.component.html',
  styleUrls: ['./create-edit-recipe.component.scss']
})
export class CreateEditRecipeComponent implements OnInit {
  //Table
  inputTableDataSource = new MatTableDataSource<Recipe['inputs'][0]>();
  inputTableDisplayedColumns: string[] = [
    /*'index', */'description', /*'unit', */'quantity', 'actions'
  ]
  
  @ViewChild('inputTablePaginator', {static:false}) set matPaginator(mp: MatPaginator){
    this.inputTableDataSource.paginator = mp;
  }
  
  //Variables
  nameFormatting$: Observable<any>;
  productList$: Observable<Product[]>;

  recipeForm: FormGroup;
  inputsForm: FormGroup;

  productsObservable$: Observable<number[]>;

  constructor(
    private dialogRef: MatDialogRef<CreateEditRecipeComponent>,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { data: Recipe, edit: boolean }
  ) { }

  ngOnInit() {
    this.initForms();
    this.initTable();
    this.initObservables();
  }

  initForms(){
    this.inputsForm = this.fb.group({
      product: ["", [Validators.required, this.recipeTypeValidator()]],
      quantity: [0, [Validators.required, Validators.min(1)]]
    })

    if (this.data.edit) {
      this.recipeForm = this.fb.group({
        name: this.fb.control(this.data.data.name, {
          validators: [Validators.required],
          asyncValidators: this.recipeNameRepeatedValidator(this.dbs, this.data),
          updateOn: 'blur'
        }),
        description: [this.data.data.description, Validators.required],
        videoURL: [this.data.data.videoURL],
      })
    }
    else {
      this.recipeForm = this.fb.group({
        name: this.fb.control(null, {
          validators: [Validators.required],
          asyncValidators: this.recipeNameRepeatedValidator(this.dbs, this.data),
          updateOn: 'blur'
        }),
        description: [null, Validators.required],
        videoURL: [null],
      })
    }
  }

  initTable(){
    if(this.data.edit){
      this.inputTableDataSource.data = this.data.data.inputs;
    } else {
      this.inputTableDataSource.data = [];
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

    this.productList$ = combineLatest(
      this.inputsForm.get('product').valueChanges.pipe(startWith('')), 
      this.dbs.getProductsListValueChanges()
      ).pipe(map(([formValue, products]) => {
        let filter = products.filter(el => el.description.match(new RegExp(formValue,'ig')));
        return filter;
      }))
  }

  //Table
  //Adding items
  onAddItem(){
    let aux = this.inputTableDataSource.data;
    aux.push({
      product: this.inputsForm.get('product').value,
      quantity: this.inputsForm.get('quantity').value,
    })
    aux.sort((a, b) => {
      if (a.product.description > b.product.description) {
        return 1;
      }
      if (a.product.description < b.product.description) {
        return -1;
      }
      return 0;
    });
    this.inputTableDataSource.data = aux;
    this.onResetInputForm();
  }

  onDeleteItem(item: Recipe['inputs'][0]){
    let aux = this.inputTableDataSource.data;
    this.inputTableDataSource.data = aux.filter(el => el == item);
    this.onResetInputForm();
  }

  onResetInputForm(){
    this.inputsForm.get('product').setValue("");
    this.inputsForm.get('quantity').setValue(0);
    this.inputsForm.get('product').markAsUntouched()
    this.inputsForm.get('quantity').markAsUntouched();
  }

  recipeTypeValidator(){
    return (control: AbstractControl): {'recipeType': boolean} => {
      if(control){
        if(control.value){
          if(typeof control.value == 'string'){
            return {recipeType: true}
          }
        }
      }
      return null
    }
  }

  deb(){
    console.log(this.recipeForm);
    console.log(this.inputsForm);
  }

  displayFn(input: Product) {
    if (!input) return '';
    return input.description;
  }

  onSubmit(user: User){
    this.recipeForm.markAsPending();

    let recipe: Recipe = {
      id: null,
      name: this.recipeForm.get('name').value.trim(),
      description: this.recipeForm.get('description').value,
      inputsId: this.inputTableDataSource.data.map(el => el.product.id),
      inputs: this.inputTableDataSource.data,
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
