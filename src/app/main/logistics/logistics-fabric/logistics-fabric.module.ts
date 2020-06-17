import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogisticsFabricRoutingModule } from './logistics-fabric-routing.module';
import { LogisticsFabricComponent } from './logistics-fabric.component';



@NgModule({
  declarations: [LogisticsFabricComponent],
  imports: [
    CommonModule,
    LogisticsFabricRoutingModule
  ]
})
export class LogisticsFabricModule { }
