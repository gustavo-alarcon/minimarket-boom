import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DatabaseService } from '../../../core/services/database.service';
import { AuthService } from '../../../core/services/auth.service';
import { AddMoneyCashConfirmComponent } from '../add-money-cash-confirm/add-money-cash-confirm.component';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-add-money-cash',
  templateUrl: './add-money-cash.component.html',
  styleUrls: ['./add-money-cash.component.scss']
})
export class AddMoneyCashComponent implements OnInit {
  
  dataFormGroup: FormGroup;

  income$: Observable<any[]>
  
  paymentType$: Observable<any[]>


  constructor(    
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<AddMoneyCashComponent>,
    public dbs: DatabaseService,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.dataFormGroup = this.fb.group({
      import: ['', Validators.required],
      incomeType: ['', Validators.required],
      paymentType: ['', Validators.required],
      description: ['', Validators.required],
      responsable: ['', Validators.required],
    })
   
    // tipo Ingreso
    this.income$ = this.dbs.getIncomes().pipe(
      tap(res => {
        return res;
      })
    ) 

    //
    this.paymentType$ = this.dbs.getPayments().pipe(
      tap(res => {
        return res;
      })
    )



  }

  addMoney(): void {

    this.dialog.open(AddMoneyCashConfirmComponent, {
      data: {
        form: this.dataFormGroup.value
      }
    })
    .afterClosed().subscribe(res=>{

      this.dialogRef.close(true);

    })  

  }


}
