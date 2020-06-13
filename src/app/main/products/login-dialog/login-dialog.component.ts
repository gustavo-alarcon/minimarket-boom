import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/core/services/auth.service';
import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss']
})
export class LoginDialogComponent implements OnInit {
  auth$: Observable<any>
  dataFormGroup: FormGroup;

  constructor(
    public auth: AuthService,
    private snackbar: MatSnackBar,
    private fb: FormBuilder,
    private dialogref: MatDialogRef<LoginDialogComponent>,
  ) { }

  ngOnInit() {
    this.dataFormGroup = this.fb.group({
      email: [null, [Validators.required]],
      pass: [null, [Validators.required]]
    });

    this.auth$ = this.auth.user$.pipe(
      map(user=>{
        if(user){
          this.dialogref.close(true)
          return true
        }else{
          return false
        }
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
        this.snackbar.open('Parece que hubo un error ...', 'Cerrar', {
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
}
