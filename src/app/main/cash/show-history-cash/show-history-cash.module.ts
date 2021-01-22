import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShowHistoryCashRoutingModule } from './show-history-cash-routing.module';

import {MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';

import {MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ShowHistoryCashRoutingModule,

    MatNativeDateModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule

  ]
})
export class ShowHistoryCashModule { }
