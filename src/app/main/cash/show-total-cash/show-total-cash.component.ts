import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from '../../../core/services/database.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-show-total-cash',
  templateUrl: './show-total-cash.component.html',
  styleUrls: ['./show-total-cash.component.scss']
})
export class ShowTotalCashComponent implements OnInit {

  constructor(
              public dbs: DatabaseService,
              @Inject(MAT_DIALOG_DATA) public data /*: TotalImports */
            ) 
            { }

  ngOnInit(): void {
  }

}
