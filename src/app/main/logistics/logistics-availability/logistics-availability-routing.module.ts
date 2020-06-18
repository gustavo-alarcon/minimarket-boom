import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogisticsAvailabilityComponent } from './logistics-availability.component';

const routes: Routes = [
  {
    path: '',
    component: LogisticsAvailabilityComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})


export class LogisticsAvailabilityRoutingModule { }
