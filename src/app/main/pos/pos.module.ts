import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PosRoutingModule } from './pos-routing.module';
import { PosComponent } from './pos.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { PosQuantityComponent } from './pos-quantity/pos-quantity.component';
import { MatTableModule } from '@angular/material/table';
import { PosFinishComponent } from './pos-finish/pos-finish.component';
import { PosSavingComponent } from './pos-saving/pos-saving.component';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Ng2ImgMaxModule } from 'ng2-img-max';
import { ProductCreateEditComponent } from '../products-list/product-create-edit/product-create-edit.component';
import { PosUnknownProductComponent } from './pos-unknown-product/pos-unknown-product.component';
import { PosTicketComponent } from './pos-ticket/pos-ticket.component';
import { NgxPrintModule } from 'ngx-print';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@NgModule({
  declarations: [PosComponent, PosQuantityComponent, PosFinishComponent, PosSavingComponent, PosUnknownProductComponent, PosTicketComponent],
  imports: [
    CommonModule,
    PosRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatMenuModule,
    MatTableModule,
    MatSelectModule,
    MatDialogModule,
    MatAutocompleteModule,
    Ng2ImgMaxModule,
    NgxPrintModule
  ],
  entryComponents: [
    PosQuantityComponent,
    PosFinishComponent,
    PosSavingComponent,
    ProductCreateEditComponent,
    PosUnknownProductComponent,
    PosTicketComponent
  ]
})
export class PosModule { }
