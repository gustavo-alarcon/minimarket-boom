import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DatabaseService } from './../../../core/services/database.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Recipe } from './../../../core/models/recipe.model';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { CreateEditRecipeComponent } from './../create-edit-recipe/create-edit-recipe.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.scss']
})
export class RecipesComponent implements OnInit {
  init$:Observable<any>

  title:string = ''

  constructor(
    private dbs: DatabaseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.init$ = this.route.params.pipe(
      tap(res=>{
        this.title = res.id
      
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
