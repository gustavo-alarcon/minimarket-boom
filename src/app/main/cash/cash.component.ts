import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ShowTotalCashComponent } from './show-total-cash/show-total-cash.component';
import { ShowHistoryCashComponent } from './show-history-cash/show-history-cash.component';
import { AddMoneyCashComponent } from './add-money-cash/add-money-cash.component';
import { RetrieveMoneyCashComponent } from './retrieve-money-cash/retrieve-money-cash.component';
import { EditInitialImportComponent } from './edit-initial-import/edit-initial-import.component';
import { CloseCashComponent } from './close-cash/close-cash.component';
import { take, tap, map, filter, startWith } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { DatabaseService } from '../../core/services/database.service';
import { Router } from '@angular/router';
import { Transaction } from '../../core/models/transaction.model';
import { ShowProductListComponent } from './show-product-list/show-product-list.component';
import * as XLSX from 'xlsx';
import { ShowDescriptionComponent } from './show-description/show-description.component';

@Component({
  selector: 'app-cash',
  templateUrl: './cash.component.html',
  styleUrls: ['./cash.component.scss']
})
export class CashComponent implements OnInit {

  barChartData='Prueba';

  userCash:User;
 
  /*Cash*/
  cash$: Observable<Transaction[]>;
  
  ingreso:string='Ingreso';
  egreso:string='Egreso';
  totalIncome:number=0;
  totalExpenses:number=0;
  openingBalace;


  loadingCash = new BehaviorSubject<boolean>(true);
  loadingCash$ = this.loadingCash.asObservable();

  dataSourceCash = new MatTableDataSource();
  displayedColumnsCash: string[] = ['index','date','type', 'description','nTicket','import','payType','productList','actions'];

  @ViewChild("paginatorCash", { static: false }) set content(paginator: MatPaginator) {
    this.dataSourceCash.paginator = paginator;
  }
  searchBoxForm: FormGroup;

  //Opening
  opening:any;

  counter:number=0;


  constructor(   
             private fb: FormBuilder,
             private dialog: MatDialog,
             public auth: AuthService,
             public dbs: DatabaseService,
             private router: Router,
             ) 
            { }

  ngOnInit(): void {
    this.searchBoxForm = this.fb.group({
          search: ['', Validators.required]
        })

    this.auth.user$.pipe(take(1)).subscribe(user => {             
        this.userCash = user;   
        console.log('this.userCash : ', this.userCash)     
       });

    
    this.dbs.getOpeningById(this.userCash.currentCash.uid,this.userCash.currentCash.currentOpening).subscribe(
     (opening:any) =>      
       {
        this.opening =opening;
        
        this.openingBalace= this.opening.openingBalance;

          console.log(' this.openings : ', this.opening);       
       }
      );
    
    /* this.dbs.getTransactionsById(this.userCash.currentCash.uid,this.userCash.currentCash.currentOpening).subscribe(
     (cash:any) =>      
       {
        this.dataSourceCash =cash;
                
        console.log('dataSourceCash : ', cash);       
      }
      ); */

   /*  this.cash$ == combineLatest(
        this.dbs.getTransactionsById(this.userCash.currentCash.uid,this.userCash.currentCash.currentOpening)
      ).pipe(
        map(([transaction]) => {
          this.dataSourceCash.data =transaction;
          return transaction;
        })
      ); */
    
    this.cash$ = combineLatest(
      this.dbs.getTransactionsById(this.userCash.currentCash.uid,this.userCash.currentCash.currentOpening),
      this.searchBoxForm.get('search').valueChanges.pipe(
          filter(input => input !== null),
          startWith<any>(''),
          map(value => typeof value === 'string' ? value.toLowerCase() : value.description.toLowerCase())),
       
      ).pipe(
        map(([cash, name, ]) => {
    
          return cash
            .filter(el => name ? el.description.toLowerCase().includes(name) : true)
            .map((el, i) => {
              return {
                ...el,
                index: i + 1
              }
            })
        }),
        tap(res => {
          this.dataSourceCash.data =res;
            this.loadingCash.next(false);
            let transactions= this.dataSourceCash.data;

            for (let i = 0; i < transactions.length; i++) {         

              if (transactions[i]['movementType']=== this.ingreso) {     
                this.totalIncome+=transactions[i]['ticket']['total'];                
              }
              
              if (transactions[i]['movementType']===this.egreso) {                
                this.totalExpenses+=transactions[i]['ticket']['total'];               
              }          
            }
            
        })
      )
  
  }
 
  //Dialog
  showTotal(){
    this.dialog.open(ShowTotalCashComponent, {
      data: {
        userCash:this.userCash,
        opening:this.opening
      }
    });
  }
  showHistory(){
    this.dialog.open(ShowHistoryCashComponent, {
      data: {
        userCash:this.userCash,
      }
    });
  }

  addMoney(){
    this.dialog.open(AddMoneyCashComponent);
  }
  retriveMoney(){
    this.dialog.open(RetrieveMoneyCashComponent);

  }
  editImport(){
    this.dialog.open(EditInitialImportComponent,
      {
        data:{
           idOpening:this.userCash.currentCash.currentOpening,
           cashier:this.userCash.currentCash.cashier,
           idCashBox:this.userCash.currentCash.uid
        }
      });

  }
  closeCash(){ 
    this.dialog.open(CloseCashComponent,{
      data:{
        user:this.userCash,
        opening:this.opening,
        totalIncomes:this.totalIncome,
        totalExpenses:this.totalExpenses,

      }
    });

  }

  showDescription(description){
    this.dialog.open(ShowDescriptionComponent,{
      data:{
        description:description,
      }
    });

  }

  showProductList(product){
    this.dialog.open(ShowProductListComponent,{
      data:{
        product:product
      }
    });
  }  



  editCash(){

  }
  deleteCash(){

  }

  downloadXls(): void {
    let table_xlsx: any[] = [];
    let headersXlsx = [
      'Fecha', 'Tipo','Descripcion', 'N° ticket', 'Importe', 'Tipo de Pago' ]
    
    table_xlsx.push(headersXlsx);

    this.dataSourceCash.filteredData.forEach(item => {
      const temp = [
        item['createdAt'],
        item['movementType'],
        item['description'],
        item['correlative'],
        item['ticket']['total'],
        item['paymentMethod']['name']
      ];

      table_xlsx.push(temp);
    })

    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(table_xlsx);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lista_transaciones');

    /* save to file */
    const name = 'Lista_transaciones' + '.xlsx';
    XLSX.writeFile(wb, name);
  }
    
}
