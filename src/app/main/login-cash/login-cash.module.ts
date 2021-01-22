import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginCashRoutingModule } from './login-cash-routing.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { MatDividerModule } from '@angular/material/divider';
import {MatSelectModule} from '@angular/material/select';



@NgModule({
  declarations: [ConfirmationComponent],
  imports: [
    CommonModule,
    LoginCashRoutingModule,

    MatFormFieldModule,
    MatIconModule,
    MatDividerModule,
    MatSelectModule,
    
  ],
})
export class LoginCashModule { }
