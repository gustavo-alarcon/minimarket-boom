import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsHistoryRoutingModule } from './products-history-routing.module';
import { ProductsHistoryComponent } from './products-history.component';



@NgModule({
  declarations: [
    ProductsHistoryComponent
  ],
  imports: [
    CommonModule,
    ProductsHistoryRoutingModule
  ]
})
export class ProductsHistoryModule { }
