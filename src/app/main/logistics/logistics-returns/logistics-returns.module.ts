import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogisticsReturnsRoutingModule } from './logistics-returns-routing.module';
import { LogisticsReturnsComponent } from './logistics-returns.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { MAT_DATE_LOCALE as MAT_DATE_LOCALESAT } from 'saturn-datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPaginationModule } from 'ngx-pagination';
import { DatePPipe } from './date-p.pipe';
import { ValidatedReturnDialogComponent } from './validated-return-dialog/validated-return-dialog.component';


@NgModule({
  declarations: [
    LogisticsReturnsComponent,
    DatePPipe,
    ValidatedReturnDialogComponent
  ],
  imports: [
    CommonModule,
    LogisticsReturnsRoutingModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    SatDatepickerModule,
    SatNativeDateModule,
    MatSelectModule,
    MatDividerModule,
    MatDialogModule,
    MatAutocompleteModule,
    MatExpansionModule,
    MatTableModule,
    MatProgressBarModule,
    MatTooltipModule,
    NgxPaginationModule,
    MatSnackBarModule 
  ],
  providers: [
    { provide: MAT_DATE_LOCALESAT, useValue: 'en-GB' }
  ]
})
export class LogisticsReturnsModule { }
