import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesComponent } from './sales.component';
import { SalesRoutingModule } from './sales-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { MatIconModule } from '@angular/material/icon';
import { SalesMasterComponent } from './sales-master/sales-master.component';
import { SalesDetailComponent } from './sales-detail/sales-detail.component';
import { MatRippleModule } from '@angular/material/core';
import { NgxPaginationModule } from 'ngx-pagination';
import {MatCardModule} from '@angular/material/card';



@NgModule({
  declarations: [
    SalesComponent,
    SalesMasterComponent,
    SalesDetailComponent
  ],
  imports: [
    CommonModule,
    SalesRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDividerModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    SatDatepickerModule, 
    SatNativeDateModule,
    MatRippleModule,
    NgxPaginationModule,
    MatCardModule
  ]
})
export class SalesModule { }
