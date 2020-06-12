import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsRoutingModule } from './products-routing.module';
import { ProductsComponent } from './products.component';
import { CreateEditRecipeComponent } from './create-edit-recipe/create-edit-recipe.component';



@NgModule({
  declarations: [
    ProductsComponent,
    CreateEditRecipeComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule
  ]
})
export class ProductsModule { }
