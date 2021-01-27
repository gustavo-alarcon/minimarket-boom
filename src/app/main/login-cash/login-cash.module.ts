import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginCashRoutingModule } from './login-cash-routing.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { MatDividerModule } from '@angular/material/divider';
import {MatSelectModule} from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';



@NgModule({
  declarations: [ConfirmationComponent],
  imports: [
    CommonModule,
    LoginCashRoutingModule,

    MatFormFieldModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule,
    MatDialogModule,
  ],
})
export class LoginCashModule { }
