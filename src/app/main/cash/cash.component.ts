import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ShowTotalCashComponent } from './show-total-cash/show-total-cash.component';
import { ShowHistoryCashComponent } from './show-history-cash/show-history-cash.component';
import { AddMoneyCashComponent } from './add-money-cash/add-money-cash.component';
import { RetrieveMoneyCashComponent } from './retrieve-money-cash/retrieve-money-cash.component';
import { EditInitialImportComponent } from './edit-initial-import/edit-initial-import.component';
import { CloseCashComponent } from './close-cash/close-cash.component';
import { CashBox } from '../../core/models/cashBox.model';
import { take, tap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { DatabaseService } from '../../core/services/database.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cash',
  templateUrl: './cash.component.html',
  styleUrls: ['./cash.component.scss']
})
export class CashComponent implements OnInit {

  userCash:User;
 
  /*Cash*/
  cash$: Observable<any[]>;

  loadingCash = new BehaviorSubject<boolean>(true);
  loadingCash$ = this.loadingCash.asObservable();

  dataSourceCash = new MatTableDataSource();
  displayedColumnsCash: string[] = ['index','date','type', 'description','nTicket','import','payType','productList','actions'];

  @ViewChild("paginatorCash", { static: false }) set content4(paginator: MatPaginator) {
    this.dataSourceCash.paginator = paginator;
  }
  searchBoxForm: FormGroup;

  //Opening
  opening:any;


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
         
        console.log(' this.currentCash dentro: ',  this.userCash);

       });

       console.log(' this.currentCash afuera : ', this.userCash);
    
    this.dbs.getOpeningById(this.userCash.currentCash.uid,this.userCash.currentCash.currentOpening).subscribe(
     (opening:any) =>      
       {
        this.opening =opening;
               
          console.log(' this.openings : ', this.opening);       
       }
      );
    
    this.dbs.getTransactionsById(this.userCash.currentCash.uid,this.userCash.currentCash.currentOpening).subscribe(
     (cash:any) =>      
       {
        this.dataSourceCash =cash;
               
        console.log('dataSourceCash : ', cash);       
       }
      );

  }
 

  editCash(){

  }
  deleteCash(){

  }

  //Dialog
  showTotal(){
    this.dialog.open(ShowTotalCashComponent, {
      data: {
        /* currentCash: this.currentCash,
        totalImport: this.totalImport,
        totalTickets: this.totalTickets,
        totalDepartures: this.totalDepartures,
        totalTicketsByPaymentType: this.totalTicketsByPaymentType,
        totalDeparturesByPaymentType: this.totalDeparturesByPaymentType */
      }
    });
  }
  showHistory(){
    this.dialog.open(ShowHistoryCashComponent, {
      data: {
        /* currentCash: this.currentCash,
        totalImport: this.totalImport,
        totalTickets: this.totalTickets,
        totalDepartures: this.totalDepartures,
        totalTicketsByPaymentType: this.totalTicketsByPaymentType,
        totalDeparturesByPaymentType: this.totalDeparturesByPaymentType */
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
    this.dialog.open(EditInitialImportComponent);

  }
  closeCash(){ 
    this.dialog.open(CloseCashComponent,{
      data:{
        user:this.userCash
      }
    });

  }
  
}
