import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DatabaseService } from '../../../core/services/database.service';
import { AuthService } from '../../../core/services/auth.service';
import { RetrieveMoneyCashConfirmComponent } from '../retrieve-money-cash-confirm/retrieve-money-cash-confirm.component';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-retrieve-money-cash',
  templateUrl: './retrieve-money-cash.component.html',
  styleUrls: ['./retrieve-money-cash.component.scss']
})
export class RetrieveMoneyCashComponent implements OnInit {

  dataFormGroup: FormGroup  ;

  expenses$: Observable<any[]>
  
  paymentType$: Observable<any[]>

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<RetrieveMoneyCashComponent>,
    public dbs: DatabaseService,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.dataFormGroup = this.fb.group({
      import: ['', Validators.required],
      expensesType: ['', Validators.required],
      paymentType: ['', Validators.required],
      description: ['', Validators.required],
      responsable: ['', Validators.required],
    })

    // 
    this.expenses$ = this.dbs.getExpenses().pipe(
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
  
  retriveMoney(){
    this.dialog.open(RetrieveMoneyCashConfirmComponent, {
      data: {
        form: this.dataFormGroup.value
      }
    })
    .afterClosed().subscribe(res=>{
      this.dialogRef.close(true);
    })  

  }

}
