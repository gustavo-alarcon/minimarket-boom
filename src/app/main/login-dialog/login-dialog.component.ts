import { DatabaseService } from 'src/app/core/services/database.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, startWith, tap, debounceTime, take, switchMap } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/services/auth.service';
import { Observable, of, combineLatest } from 'rxjs';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit {
  auth$: Observable<any>
  dataFormGroup: FormGroup;

  hidePass: boolean = true;

  register: boolean = false

  registerForm = new FormControl(false)
  register$: Observable<boolean>

  constructor(
    public auth: AuthService,
    private dbs: DatabaseService,
    private snackbar: MatSnackBar,
    private fb: FormBuilder,
    private dialogref: MatDialogRef<LoginDialogComponent>,
  ) { }

  ngOnInit() {
    this.dataFormGroup = this.fb.group({
      email: [null, [Validators.required, Validators.email], [this.emailRepeatedValidator()]],
      pass: [null, [Validators.required, Validators.minLength(6)]]
    });

    this.auth$ = this.auth.user$.pipe(
      map(user => {
        if (user) {
          this.dialogref.close(true)
          return true
        } else {
          return false
        }
      })
    )

    this.register$ = this.registerForm.valueChanges.pipe(
      startWith(false),
      tap(res => {
        this.register = res
      })
    )

  }

  login(): void {
    this.auth.signInEmail(this.dataFormGroup.value['email'], this.dataFormGroup.value['pass'])
      .then(res => {
        this.snackbar.open('Hola!', 'Cerrar', {
          duration: 6000
        });
        this.dialogref.close(true);
      })
      .catch(err => {
        this.snackbar.open(err.message, 'Cerrar', {
          duration: 6000
        });
        console.log(err.message);
      })
  }

  registerUser(): void {
    this.auth.signUp(this.dataFormGroup.value)
      .then(res => {
        this.snackbar.open('Bienvenid@!', 'Cerrar', {
          duration: 6000
        });
        this.dialogref.close(true);
      })
      .catch(error => {
        this.snackbar.open('Parece que hubo un error ...', 'Cerrar', {
          duration: 6000
        });
        console.log(error);
      });
  }

  emailRepeatedValidator() {
    return (control: AbstractControl) => {
      const value = control.value.toLowerCase();
      if(this.register){
        return of(null)
      }else{
        return this.dbs.getUsersStatic().pipe(
          map(res => !!res.find(el => el.email.toLowerCase() == value) ? { emailRepeatedValidator: true } : null))
      }
    }
  }
}
