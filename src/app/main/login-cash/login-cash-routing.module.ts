import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginCashComponent } from './login-cash.component';


const routes: Routes = [
  {
    path: '',
    component: LoginCashComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginCashRoutingModule { }
