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
      return this.dbs.getUsersStatic().pipe(
        map(res => {
          if (this.register) {
            return res.find(el => el.email.toLowerCase() == value) ? null : { emailRepeatedValidator: true }
          } else {
            return res.find(el => el.email.toLowerCase() == value) ? { emailRepeatedValidator: true } : null
          }

        }))

    }
  }

  reset() {
    this.dataFormGroup = this.fb.group({
      email: [null, [Validators.required, Validators.email], [this.emailRepeatedValidator()]],
      pass: [null, [Validators.required, Validators.minLength(6)]]
    });


  }

  passwordReset() {
    if (this.dataFormGroup.get('email').value) {
      if (this.dataFormGroup.get('email').valid) {
        //console.log('email');
        this.auth.resetPassword(this.dataFormGroup.get('email').value).then(() => {
          // Email sent.

          this.snackbar.open(
            'Se envió un correo para restaurar su contraseña',
            'Cerrar',
            { duration: 6000, }
          );
        }).catch((error) => {
          this.snackbar.open(
            'Ocurrió un error. Por favor, vuelva a intentarlo.',
            'Cerrar',
            { duration: 6000, }
          );
        });

      } else {
        this.snackbar.open('Escribe un correo válido', 'Cerrar', {
          duration: 6000
        });
      }
    } else {
      //this.dataFormGroup.get('email').setErrors()
    }
  }
}
