import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';
import { ProductsRoutingModule } from './products-routing.module';
import { ProductsComponent } from './products.component';
import { CreateEditRecipeComponent } from './create-edit-recipe/create-edit-recipe.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
import { PurchaseComponent } from './purchase/purchase.component';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';
import { RecipesComponent } from './recipes/recipes.component';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { NgxPaginationModule } from 'ngx-pagination';
import { Ng2ImgMaxModule } from 'ng2-img-max';
import { SaleDialogComponent } from './sale-dialog/sale-dialog.component';

@NgModule({
  declarations: [
    ProductsComponent,
    ShoppingCartComponent,
    PurchaseComponent,
    LoginDialogComponent,
    CreateEditRecipeComponent,
    RecipesComponent,
    SaleDialogComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatNativeDateModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyA2tVXwzAQc5Ppj8-oTEuYBCFyJp39Hz7s'
    }),
    LazyLoadImageModule.forRoot(),
    NgxPaginationModule,
    Ng2ImgMaxModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ],
  entryComponents: [
    LoginDialogComponent,
    CreateEditRecipeComponent,
    SaleDialogComponent
  ]
})
export class ProductsModule { }
