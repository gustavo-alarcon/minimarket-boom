
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';

//Material
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';


import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { MatExpansionModule } from '@angular/material/expansion';
import { CashComponent } from './cash/cash.component';
import { LoginCashComponent } from './login-cash/login-cash.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ReportsComponent } from './reports/reports.component';


@NgModule({
  declarations: [
    MainComponent,
    ConfirmationDialogComponent,
    LoginDialogComponent,
    CashComponent,
    LoginCashComponent,
    ReportsComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatSidenavModule,
    MatProgressBarModule,
    MatButtonModule,
    MatDividerModule,
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    FormsModule,
    MatCheckboxModule,
    MatInputModule,
    MatExpansionModule,
    MatSelectModule,
    MatPaginatorModule,
    MatTableModule,

    MatNativeDateModule,
    MatDatepickerModule,

  
  ],
  entryComponents: [
    ConfirmationDialogComponent,
    LoginDialogComponent
  ]
})
export class MainModule { }
