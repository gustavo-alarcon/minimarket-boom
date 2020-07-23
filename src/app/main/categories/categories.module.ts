import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { CategoriesRoutingModule } from './categories-routing.module';
import { CategoriesComponent } from './categories.component';


@NgModule({
  declarations: [CategoriesComponent],
  imports: [
    CommonModule,
    CategoriesRoutingModule,
    LazyLoadImageModule
  ]
})
export class CategoriesModule { }
