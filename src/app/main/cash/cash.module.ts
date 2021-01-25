import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatPaginatorModule } from '@angular/material/paginator';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';


import { CashRoutingModule } from './cash-routing.module';

import { ShowTotalCashComponent } from './show-total-cash/show-total-cash.component';
import { AddMoneyCashComponent } from './add-money-cash/add-money-cash.component';
import { ShowHistoryCashComponent } from './show-history-cash/show-history-cash.component';
import { RetrieveMoneyCashComponent } from './retrieve-money-cash/retrieve-money-cash.component';
import { AddMoneyCashConfirmComponent } from './add-money-cash-confirm/add-money-cash-confirm.component';
import { RetrieveMoneyCashConfirmComponent } from './retrieve-money-cash-confirm/retrieve-money-cash-confirm.component';
import { CloseCashComponent } from './close-cash/close-cash.component';
import { EditInitialImportComponent } from './edit-initial-import/edit-initial-import.component';


@NgModule({
  declarations: [ShowTotalCashComponent,ShowHistoryCashComponent, AddMoneyCashComponent, RetrieveMoneyCashComponent, AddMoneyCashConfirmComponent, RetrieveMoneyCashConfirmComponent, CloseCashComponent, EditInitialImportComponent],
  imports: [
    CommonModule,
    CashRoutingModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatSelectModule,
    MatTabsModule,
    MatTableModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatCardModule,
    NgxPaginationModule,
    LazyLoadImageModule,
    DragDropModule,
    MatMenuModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule, 
    ReactiveFormsModule,

    SatDatepickerModule,
    SatNativeDateModule
  ]
})
export class CashModule { }
