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
    MatDividerModule
  ]
})
export class StoreSalesModule { }
