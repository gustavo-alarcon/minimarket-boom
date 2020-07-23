import { AuthService } from 'src/app/core/services/auth.service';
import { tap, take, switchMap, map } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { DatabaseService } from './../../../core/services/database.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Recipe } from './../../../core/models/recipe.model';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { CreateEditRecipeComponent } from './../create-edit-recipe/create-edit-recipe.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/core/models/product.model';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent implements OnInit {
  init$: Observable<{ title: string, recipes: Recipe[] }>

  category: string = ''

  product: Product = null

  constructor(
    private dbs: DatabaseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    public sanitizer: DomSanitizer,
    public auth: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.init$ = combineLatest(
      this.route.params,
      this.dbs.getProductsListValueChanges()
    ).pipe(
      take(1),
      map(([route, products]) => {
        this.category = products.filter(el => el.id == route.id).map(el => el['category'])[0]
        this.product = products.filter(el => el.id == route.id)[0]
        console.log(this.product);
        
        return route
      }),
      switchMap(res =>
        this.dbs.getProductRecipesValueChanges(res.id),
        (productId, recipes) => {
          if (recipes.length) {
            let title = (<Product>recipes[0].products.find(el => el.id == <string>productId.id)).description;
            return {
              title,
              recipes
            }
          } else {
            return {
              title: 'Sin recetas',
              recipes: []
            }
          }
        })
    )
  }

  onCreateEditRecipe(edit: boolean, recipe: Recipe) {
    let dialogRef: MatDialogRef<CreateEditRecipeComponent>;
    if (edit == true) {
      dialogRef = this.dialog.open(CreateEditRecipeComponent, {
        width: '350px',
        data: {
          data: recipe,
          edit: edit,
          product: this.product
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
          edit: edit,
          product: this.product
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

  retun() {
    this.router.navigate(['/main/products'], { fragment: this.category });
  }

}
