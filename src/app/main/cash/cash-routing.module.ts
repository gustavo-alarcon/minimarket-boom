import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CashComponent } from './cash.component';


const routes: Routes = [
  {
    path: '',
    component: CashComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CashRoutingModule { }
