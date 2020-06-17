import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogisticsAvailabilityRoutingModule } from './logistics-availability-routing.module';
import { LogisticsAvailabilityComponent } from './logistics-availability.component';



@NgModule({
  declarations: [LogisticsAvailabilityComponent],
  imports: [
    CommonModule,
    LogisticsAvailabilityRoutingModule
  ]
})
export class LogisticsAvailabilityModule { }
