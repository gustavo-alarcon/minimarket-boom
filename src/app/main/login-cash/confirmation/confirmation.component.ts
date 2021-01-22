import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CashBox } from '../../../core/models/cashBox.model';
import { Router } from '@angular/router';
import { AddCashBoxComponent } from '../../configuration/add-cash-box/add-cash-box.component';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {

  
  constructor(    
     private router: Router,
     private dialogRef: MatDialogRef<AddCashBoxComponent>,
     @Inject(MAT_DIALOG_DATA) public data: { item: CashBox },
  ) { }

  ngOnInit(): void {
    console.log('data : ', this.data);
  }
  
  navigate(){
    this.router.navigateByUrl('main/cash');
    this.dialogRef.close();
  }
}
