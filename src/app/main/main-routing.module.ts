import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'products',
        loadChildren: () => import('./products/products.module').then(mod => mod.ProductsModule),
        //canActivate: [AuthGuard]
      },
      {
        path: 'products-history',
        loadChildren: () => import('./products-history/products-history.module').then(mod => mod.ProductsHistoryModule),
        //canActivate: [AuthGuard]
      },
      {
        path: 'products-list',
        loadChildren: () => import('./products-list/products-list.module').then(mod => mod.ProductsListModule),
        //canActivate: [AuthGuard]
      },
      {
        path: 'logistics',
        loadChildren: () => import('./logistics/logistics.module').then(mod => mod.LogisticsModule),
        //canActivate: [AuthGuard]
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
