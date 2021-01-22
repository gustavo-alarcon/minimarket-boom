import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DatabaseService } from '../../../core/services/database.service';
import { AuthService } from '../../../core/services/auth.service';
import { AddMoneyCashConfirmComponent } from '../add-money-cash-confirm/add-money-cash-confirm.component';

@Component({
  selector: 'app-add-money-cash',
  templateUrl: './add-money-cash.component.html',
  styleUrls: ['./add-money-cash.component.scss']
})
export class AddMoneyCashComponent implements OnInit {
  
  dataFormGroup: FormGroup  ;

  constructor(    
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<AddMoneyCashComponent>,
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

  addMoney(){
    this.dialog.open(AddMoneyCashConfirmComponent);

  }

}
