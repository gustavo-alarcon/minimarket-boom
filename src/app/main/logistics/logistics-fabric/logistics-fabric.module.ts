import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogisticsFabricRoutingModule } from './logistics-fabric-routing.module';
import { LogisticsFabricComponent } from './logistics-fabric.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RequestCreateEditComponent } from './request-create-edit/request-create-edit.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatNativeDateModule } from '@angular/material/core';




@NgModule({
  declarations: [
    LogisticsFabricComponent, 
    RequestCreateEditComponent
  ],
  imports: [
    CommonModule,
    LogisticsFabricRoutingModule,
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
  ],
  entryComponents: [
    RequestCreateEditComponent
  ]
})
export class LogisticsFabricModule { }
