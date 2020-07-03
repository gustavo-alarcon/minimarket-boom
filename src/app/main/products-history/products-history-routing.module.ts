import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ProductsHistoryComponent } from './products-history.component';

const routes: Routes = [
  {
    path: '',
    component: ProductsHistoryComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsHistoryRoutingModule { }
