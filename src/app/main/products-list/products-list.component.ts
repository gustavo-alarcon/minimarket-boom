import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';

import { DatabaseService } from 'src/app/core/services/database.service';
import { AuthService } from 'src/app/core/services/auth.service';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { Product } from 'src/app/core/models/product.model';
import { Observable, combineLatest } from 'rxjs';
import { startWith, tap, map, share } from 'rxjs/operators';
import { ProductCreateEditComponent } from './product-create-edit/product-create-edit.component';


@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductsListComponent implements OnInit {
  //Forms
  categoryForm: FormControl;
  itemsFilterForm: FormControl;
  promoFilterForm: FormControl;

  //Table
  productsTableDataSource = new MatTableDataSource<Product>();
  productsDisplayedColumns: string[] = [
    'index', 'photoURL', 'description', 'category', 'price', 'unit', 'refPrice', 'refUnit', 'actions'
  ]
  productsObservable$: Observable<Product[]>
  @ViewChild('productsPaginator', { static: false }) set content(paginator1: MatPaginator) {
    this.productsTableDataSource.paginator = paginator1;
  }

  //Observables
  categoryObservable$: Observable<[any, string[]]>
  categoryList$: Observable<string[]>
  filter$: Observable<boolean>


  //Variables
  defaultImage = "../../../assets/images/default-image.png";
  p1: number = 1;

  //noResult
  noResult$: Observable<string>;
  noResultImage: string = ''

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    public snackBar: MatSnackBar,
    private dbs: DatabaseService,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.initObservables();
  }

  initForms() {
    this.categoryForm = this.fb.control("");
    this.itemsFilterForm = this.fb.control("");
    this.promoFilterForm = this.fb.control(false);
  }

  initObservables() {
    this.productsTableDataSource.filterPredicate =
      (data: Product, filter: string) => {
        let category = filter.trim().split('&+&')[0];   //category
        let name = filter.trim().split('&+&')[1];       //product name
        let promo = filter.trim().split('&+&')[2];                    //promo
        return (data.category.match(new RegExp(category,'ig'))
          && data.description.match(new RegExp(name, 'ig'))
          && (String(data.promo) == promo || promo == "false"))
      }

    this.categoryObservable$ = combineLatest(
      this.categoryForm.valueChanges.pipe(startWith('')), 
      this.dbs.getProductsListCategoriesValueChanges()
      ).pipe(share());

    this.categoryList$ = this.categoryObservable$.pipe(map(([formValue, categories]) => {
      let filter = categories.filter(el => el.match(new RegExp(formValue,'ig')));
      if (!(filter.length == 1 && filter[0] === formValue) && formValue.length) {
        this.categoryForm.setErrors({ invalid: true });
      }
      return filter;
    }));

    this.filter$ = combineLatest(
      this.categoryObservable$,
      this.itemsFilterForm.valueChanges.pipe(startWith('')),
      this.promoFilterForm.valueChanges.pipe(startWith(false)))
      .pipe(
        map(([[categoryFormValue, categories], itemsFormValue, promoFormValue]) => {
          this.productsTableDataSource.filter = categoryFormValue + '&+&' + itemsFormValue + '&+&' + promoFormValue;
          return true
        }),
        tap(res => {
          this.p1 = 1
        })
      )

    this.productsObservable$ = this.dbs.getProductsListValueChanges().pipe(
      tap(res => {
        this.productsTableDataSource.data = [...res]
      })
    )
  }

  onPublish(product: Product, publish: boolean) {
    // let prod = product;
    // prod.published = publish;
    // this.dbs.createEditProduct(true, prod, product).subscribe(
    //   batch => {
    //     batch.commit().then(
    //       res => {
    //         this.snackBar.open('Producto editado satisfactoriamente.', 'Aceptar');
    //       },
    //       err => {
    //         this.snackBar.open('Ocurrió un error. Vuelva a intentarlo.', 'Aceptar');
    //       }
    //     )
    //   },
    //   err => {
    //     this.snackBar.open('Ocurrió un error. Vuelva a intentarlo.', 'Aceptar');
    //   }
    // )
  }

  onDeleteItem(product: Product) {
    // this.dbs.deleteProduct(product).subscribe(
    //   batch => {
    //     batch.commit().then(
    //       res => {
    //         this.snackBar.open('Producto eliminado satisfactoriamente.', 'Aceptar');
    //       },
    //       err => {
    //         this.snackBar.open('Ocurrió un error. Vuelva a intentarlo.', 'Aceptar');
    //       }
    //     )
    //   },
    //   err => {
    //     this.snackBar.open('Ocurrió un error. Vuelva a intentarlo.', 'Aceptar');
    //   })
  }

  onPromo(product: Product) {
    // let dialogRef: MatDialogRef<ProductConfigPromoComponent>;
    // dialogRef = this.dialog.open(ProductConfigPromoComponent, {
    //   width: '350px',
    //   data: {
    //     data: product,
    //   }
    // });
    // dialogRef.afterClosed().subscribe(res => {
    //   switch (res) {
    //     case true:
    //       this.snackBar.open('El producto fue editado satisfactoriamente', 'Aceptar', { duration: 5000 });
    //       break;
    //     case false:
    //       this.snackBar.open('Ocurrió un error. Por favor, vuelva a intentarlo', 'Aceptar', { duration: 5000 });
    //       break;
    //     default:
    //       break;
    //   }
    // })
  }

  onCreateEditItem(edit: boolean, product?: Product) {
    let dialogRef: MatDialogRef<ProductCreateEditComponent>;
    if (edit == true) {
      dialogRef = this.dialog.open(ProductCreateEditComponent, {
        width: '350px',
        data: {
          data: product,
          edit: edit
        }
      });
      dialogRef.afterClosed().subscribe(res => {
        switch (res) {
          case true:
            this.snackBar.open('El producto fue editado satisfactoriamente', 'Aceptar', { duration: 5000 });
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
      dialogRef = this.dialog.open(ProductCreateEditComponent, {
        width: '350px',
        data: {
          data: null,
          edit: edit
        }
      });
      dialogRef.afterClosed().subscribe(res => {
        switch (res) {
          case true:
            this.snackBar.open('El nuevo producto fue creado satisfactoriamente', 'Aceptar', { duration: 5000 });
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
