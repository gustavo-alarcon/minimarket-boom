import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParentListComponent } from './parent-list.component';
import { Routes, RouterModule } from '@angular/router';



const routes: Routes = [
  {
    path: '',
    component: ParentListComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ProductsListRoutingModule { }
