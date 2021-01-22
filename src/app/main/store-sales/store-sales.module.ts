import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreSalesRoutingModule } from './store-sales-routing.module';
import { StoreSalesComponent } from './store-sales.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgxPrintModule } from 'ngx-print';


import { MatNativeDateModule } from '@angular/material/core';
import {MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
  declarations: [StoreSalesComponent],
  imports: [
    CommonModule,
    StoreSalesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,

    MatNativeDateModule,
    MatDatepickerModule,
    
    SatDatepickerModule,
    SatNativeDateModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatProgressBarModule,
    NgxPrintModule
  ]
})
export class StoreSalesModule { }
