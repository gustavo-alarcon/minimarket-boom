import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { DatabaseService } from '../../../core/services/database.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-show-history-cash',
  templateUrl: './show-history-cash.component.html',
  styleUrls: ['./show-history-cash.component.scss']
})
export class ShowHistoryCashComponent implements OnInit {

  dateForm: FormGroup;

  date = new FormControl();

  dataSourceHistory = new MatTableDataSource();
  displayedColumnsHistory: string[] = ['index','opening','closing', 'totalBalance','openingAmount','totalIncome','totalDeaperture','responsable','actions'];

  @ViewChild("paginatorHistoyr", { static: false }) set content(paginator: MatPaginator) {
    this.dataSourceHistory.paginator = paginator;
  }
  searchBoxForm: FormGroup;

  constructor(
    public dbs: DatabaseService,
    @Inject(MAT_DIALOG_DATA) public data /*: TotalImports */
  ) { }

  ngOnInit(): void {
    const view = this.dbs.getCurrentMonthOfViewDate();

    let beginDate = view.from;
    let endDate = new Date();
    endDate.setHours(23, 59, 59);

    this.dateForm = new FormGroup({
      start: new FormControl(beginDate),
      end: new FormControl(endDate)
    });
  }

}
