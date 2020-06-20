import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsHistoryRoutingModule } from './products-history-routing.module';
import { ProductsHistoryComponent } from './products-history.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { MAT_DATE_LOCALE as MAT_DATE_LOCALESAT } from 'saturn-datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ProductsHistoryComponent,
  ],
  imports: [
    CommonModule,
    ProductsHistoryRoutingModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatSelectModule,
    MatCardModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    SatDatepickerModule, 
    SatNativeDateModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALESAT, useValue: 'en-GB' }
  ]
})
export class ProductsHistoryModule { }
