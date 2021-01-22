import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DatabaseService } from '../../../core/services/database.service';
import { AuthService } from '../../../core/services/auth.service';
import { RetrieveMoneyCashConfirmComponent } from '../retrieve-money-cash-confirm/retrieve-money-cash-confirm.component';

@Component({
  selector: 'app-retrieve-money-cash',
  templateUrl: './retrieve-money-cash.component.html',
  styleUrls: ['./retrieve-money-cash.component.scss']
})
export class RetrieveMoneyCashComponent implements OnInit {

  dataFormGroup: FormGroup  ;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<RetrieveMoneyCashComponent>,
    public dbs: DatabaseService,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.dataFormGroup = this.fb.group({
      IncomeImport: ['', Validators.required],
      departureType: ['', Validators.required],
      expenseType: ['', Validators.required],
      description: ['', Validators.required],
      user: ['', Validators.required],
    })
  }
  
  retriveMoney(){
    this.dialog.open(RetrieveMoneyCashConfirmComponent);

  }

}
