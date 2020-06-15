import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-sale-dialog',
  templateUrl: './sale-dialog.component.html',
  styleUrls: ['./sale-dialog.component.scss']
})
export class SaleDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { name: string, email: string, number: string },
  ) { }

  ngOnInit(): void {
  }

}
