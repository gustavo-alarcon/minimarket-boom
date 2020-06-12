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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsRoutingModule } from './products-routing.module';
import { ProductsComponent } from './products.component';
import { CreateEditRecipeComponent } from './create-edit-recipe/create-edit-recipe.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
import { PurchaseComponent } from './purchase/purchase.component';
//import { NgxPaginationModule } from 'ngx-pagination';
//import { LazyLoadImageModule,  intersectionObserverPreset } from 'ng-lazyload-image';



@NgModule({
  declarations: [
    ProductsComponent,
    ShoppingCartComponent,
    PurchaseComponent,
    CreateEditRecipeComponent
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
    FormsModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  providers: [
    CreateEditRecipeComponent
  ]
})
export class ProductsModule { }
