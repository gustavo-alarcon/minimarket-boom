import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogisticsReturnsRoutingModule } from './logistics-returns-routing.module';
import { LogisticsReturnsComponent } from './logistics-returns.component';



@NgModule({
  declarations: [LogisticsReturnsComponent],
  imports: [
    CommonModule,
    LogisticsReturnsRoutingModule
  ]
})
export class LogisticsReturnsModule { }
