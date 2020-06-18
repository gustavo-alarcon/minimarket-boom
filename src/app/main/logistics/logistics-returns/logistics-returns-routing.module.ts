import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogisticsReturnsComponent } from './logistics-returns.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticsReturnsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class LogisticsReturnsRoutingModule { }
