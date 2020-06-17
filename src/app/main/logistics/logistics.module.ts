import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogisticsRoutingModule } from './logistics-routing.module';
import { LogisticsComponent } from './logistics.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';




@NgModule({
  declarations: [
    LogisticsComponent
  ],
  imports: [
    CommonModule,
    LogisticsRoutingModule,
    MatDividerModule,
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule
  ]
})
export class LogisticsModule { }
