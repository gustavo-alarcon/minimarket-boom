import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogisticsFabricComponent } from './logistics-fabric.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticsFabricComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class LogisticsFabricRoutingModule { }
