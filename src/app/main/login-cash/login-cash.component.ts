import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { Observable } from 'rxjs';
import { tap, map, take } from 'rxjs/operators';
import { DatabaseService } from '../../core/services/database.service';
import { CashBox } from '../../core/models/cashBox.model';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login-cash',
  templateUrl: './login-cash.component.html',
  styleUrls: ['./login-cash.component.scss']
})
export class LoginCashComponent implements OnInit {

  loginForm: FormGroup;
  hidePass: boolean = true;
  validatorPass: boolean = false;

  boxList$: Observable<CashBox[]>;

  currentCash: CashBox = null;

  navigate: string;

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    public dbs: DatabaseService,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar
  ) {

  }

  ngOnInit(): void {
    this.dbs.changeTitle('Login')

    this.navigate = this.route.snapshot.paramMap.get("login");

    this.loginForm = this.fb.group({
      caja: ['', Validators.required],
      pass: ['', Validators.required],
      openingBalance: ['', Validators.required],

    })

    this.boxList$ = this.dbs.getCashierValueChanges().pipe(
      tap(res => {
        return res
      }))
  }

  login(data) {
    this.dbs.loginCash(this.loginForm.get('caja').value, this.loginForm.get('pass').value).pipe(take(1))
      .subscribe(user => {

        this.currentCash = user['0'];

        // If the cashbox is open, you cant open it again. Just one person can use it at time
        if (this.currentCash.open) {
          this.snackbar.open('🚨 No puede acceder a esta caja, ya se encuentra en uso!', 'Aceptar', {
            duration: 6000
          });
          return;
        }

        if (user.length >= 1) {

          this.dialog.open(ConfirmationComponent, {
            data: {
              cashBox: this.currentCash,
              openingBalance: this.loginForm.value['openingBalance'],
              login: this.navigate
            }
          })
        }
        else {
          this.validatorPass = true;
        }
      })
  }
}
