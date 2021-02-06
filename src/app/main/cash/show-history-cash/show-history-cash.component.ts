import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { DatabaseService } from '../../../core/services/database.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormGroup, FormControl } from '@angular/forms';
import { startWith, map, tap, switchMap } from 'rxjs/operators';
import { combineLatest, Observable, BehaviorSubject } from 'rxjs';
import * as XLSX from 'xlsx';
 import { CashOpening } from '../../../core/models/cashOpening.model';
import { AuthService } from '../../../core/services/auth.service';
import { ShowTransactionsComponent } from '../show-transactions/show-transactions.component';

@Component({
  selector: 'app-show-history-cash',
  templateUrl: './show-history-cash.component.html',
  styleUrls: ['./show-history-cash.component.scss']
})
export class ShowHistoryCashComponent implements OnInit {

  dateForm: FormGroup;

  date = new FormControl();

  history$: Observable<any>;


  loadingHistory = new BehaviorSubject<boolean>(true);
  loadingHistory$ = this.loadingHistory.asObservable();

  dataSourceHistory = new MatTableDataSource<CashOpening>();
  displayedColumnsHistory: string[] = ['index','opening','closing', 'totalBalance','openingAmount','totalIncome','totalDeaperture','responsable','actions'];

  @ViewChild("paginatorHistory", { static: false }) set content(paginator: MatPaginator) {
    this.dataSourceHistory.paginator = paginator;
  }
  searchBoxForm: FormGroup;

  constructor(    
    private dialog: MatDialog,
    public auth: AuthService,
    public dbs: DatabaseService,
    @Inject(MAT_DIALOG_DATA) public data:{userCash}
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


    this.history$= combineLatest(         
      this.dbs.getAllOpeningsById(this.data.userCash.currentCash.uid),
      this.dateForm.get('start').valueChanges.pipe(
        startWith(beginDate),
        map(begin => begin.setHours(0, 0, 0, 0))
      ),
      this.dateForm.get('end').valueChanges.pipe(
        startWith(endDate),
        map(end =>  end?end.setHours(23, 59, 59):null)
      )
      
    ).pipe(
      map(([openings,startdate,enddate ]) => {

        let date = {begin:startdate,end:enddate}

        return openings.filter((el) => {
          return this.getFilterTime(el["openingDate"], date);
        });
        
      })
      ,
      tap(res => {
        console.log('dataSource : ', res)
        this.dataSourceHistory.data =res;
        this.loadingHistory.next(false) 
      }) 
    )

  }

  getFilterTime(el, time) {
    let date = el.toMillis();
    let begin = time.begin;
    let end = time.end;
    return date >= begin && date <= end;
  }

  showTransations(dataOpening){
    this.dialog.open(ShowTransactionsComponent,{
      data:{
        idTransacion:dataOpening.uid,  
        idUserCash:this.data.userCash.currentCash.uid,  
      }
    });
  }

  downloadXls(): void {
    let table_xlsx: any[] = [];
    let headersXlsx = [
      'Apertura', 'Cierre','Saldo total', 'Importe de apertura', 'Total de Ingresos', 'Total de egreso','Responsable' ]
    
    table_xlsx.push(headersXlsx);

    this.dataSourceHistory.filteredData.forEach(item => {
      const temp = [
        item.openingDate,
        item.closureDate,
        item.totalBalance,
        item.openingBalance,
        item.totalIncome,
        item.totalExpenses,
        item.closedBy
      ];

      table_xlsx.push(temp);
    })

    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(table_xlsx);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lista_Opening');

    /* save to file */
    const name = 'Lista_operaciones' + '.xlsx';
    XLSX.writeFile(wb, name);
  }

}
