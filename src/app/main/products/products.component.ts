import { AuthService } from 'src/app/core/services/auth.service';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { map, startWith, filter, take } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { DatabaseService } from 'src/app/core/services/database.service';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { CreateEditRecipeComponent } from './create-edit-recipe/create-edit-recipe.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Recipe } from 'src/app/core/models/recipe.model';
import { Product } from 'src/app/core/models/product.model';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  view: BehaviorSubject<number> = new BehaviorSubject(1)
  view$: Observable<number> = this.view.asObservable();

  products$: Observable<Product[]>

  total: number = 0

  searchForm: FormControl = new FormControl('')

  constructor(
    private dbs: DatabaseService,
    private dialog: MatDialog,
    public auth: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.products$ = combineLatest(
      this.dbs.getProductsListValueChanges(),
      this.searchForm.valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => value.toLowerCase())
      )
    ).pipe(
      map(([products,search])=>{
        return products.filter(el=>search?el.description.toLowerCase().includes(search):true)
      })
    )
    
    this.total = this.dbs.order.map(el => el['product']['price'] * el['quantity']).reduce((a, b) => a + b, 0)
  }

  add(item) {
    let index = this.dbs.order.findIndex(el => el['product']['id'] == item['id'])

    if (index == -1) {
      let newproduct = {
        product: item,
        quantity: 1
      }
      this.dbs.order.push(newproduct)
    } else {
      this.dbs.order[index]['quantity']++
    }

    this.total = this.dbs.order.map(el => el['product']['price'] * el['quantity']).reduce((a, b) => a + b, 0)
  }

  login(){
    this.dialog.open(LoginDialogComponent).afterClosed().pipe(
      take(1)
    ).subscribe(res=>{
      if(res){
        this.finish()
      }
    })
  }

  shoppingCart() {
    this.view.next(2)
  }

  back() {
    this.view.next(1)
    this.total = this.dbs.order.map(el => el['product']['price'] * el['quantity']).reduce((a, b) => a + b, 0)
  }

  finish() {
    this.view.next(3)
  }

  onCreateEditRecipe(edit: boolean, recipe: Recipe){
    let dialogRef: MatDialogRef<CreateEditRecipeComponent>;
    if (edit == true) {
      dialogRef = this.dialog.open(CreateEditRecipeComponent, {
        width: '350px',
        data: {
          data: recipe,
          edit: edit
        }
      });
      dialogRef.afterClosed().subscribe(res => {
        switch (res) {
          case true:
            this.snackBar.open('La receta fue editada satisfactoriamente', 'Aceptar', { duration: 5000 });
            break;
          case false:
            this.snackBar.open('Ocurrió un error. Por favor, vuelva a intentarlo', 'Aceptar', { duration: 5000 });
            break;
          default:
            break;
        }
      })
    }
    else {
      dialogRef = this.dialog.open(CreateEditRecipeComponent, {
        width: '350px',
        data: {
          data: null,
          edit: edit
        }
      });
      dialogRef.afterClosed().subscribe(res => {
        switch (res) {
          case true:
            this.snackBar.open('La receta fue creada satisfactoriamente', 'Aceptar', { duration: 5000 });
            break;
          case false:
            this.snackBar.open('Ocurrió un error. Por favor, vuelva a intentarlo', 'Aceptar', { duration: 5000 });
            break;
          default:
            break;
        }
      })
    }
  }

}
