import { map } from 'rxjs/operators';
import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from '../../../core/services/database.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../../core/models/user.model';
import { CashOpening } from '../../../core/models/cashOpening.model';
import { Transaction } from '../../../core/models/transaction.model';

@Component({
  selector: 'app-show-total-cash',
  templateUrl: './show-total-cash.component.html',
  styleUrls: ['./show-total-cash.component.scss']
})
export class ShowTotalCashComponent implements OnInit {

  ingreso:string='Ingreso';
  egreso:string='Egreso';

  iziPay:string ='IZIPAY';
  visa:string='visa';
  efectivo:string='Efectivo'
  yape:string='Yape';


  transactions:Transaction[];
  totalIncome:number=0;
  totalExpenses:number=0;

  totalIncomeIZIPAY:number=0;
  totalIncomeVisa:number=0;
  totalIncomeEfectivo:number=0;
  totalIncomeYape:number=0;

  totalExpensesIZIPAY:number=0;
  totalExpensesVisa:number=0;
  totalExpensesEfectivo:number=0;
  totalExpensesYape:number=0;


  constructor(
              public dbs: DatabaseService,
              @Inject(MAT_DIALOG_DATA) public data:{userCash:User,opening:CashOpening} 
            ) 
            { }

  ngOnInit(): void {

    this.dbs.getTransactionsById(this.data.userCash.currentCash.uid,this.data.userCash.currentCash.currentOpening).subscribe(
     (transaction:any) =>      
       {
      
        this.transactions=transaction;
          
        for (let i = 0; i < this.transactions.length; i++) {         

          if (this.transactions[i].movementType=== this.ingreso) { 

            this.totalIncome+=this.transactions[i].ticket.total;

            if (this.transactions[i].paymentMethod.name===this.iziPay) {
              this.totalIncomeIZIPAY+=this.transactions[i].ticket.total;            
            }
  
            if (this.transactions[i].paymentMethod.name=== this.visa) {
              this.totalIncomeVisa+=this.transactions[i].ticket.total;            
            }
  
            if (this.transactions[i].paymentMethod.name=== this.efectivo) {
              this.totalIncomeEfectivo+=this.transactions[i].ticket.total;            
            }
  
            if (this.transactions[i].paymentMethod.name===this.yape) {
              this.totalIncomeYape+=this.transactions[i].ticket.total;            
            }
  

          }

          if (this.transactions[i].movementType===this.egreso) {

            this.totalExpenses+=this.transactions[i].ticket.total;    
            
            if (this.transactions[i].paymentMethod.name===this.iziPay) {
              this.totalExpensesIZIPAY+=this.transactions[i].ticket.total;            
            }
  
            if (this.transactions[i].paymentMethod.name=== this.visa) {
              this.totalExpensesVisa+=this.transactions[i].ticket.total;            
            }
  
            if (this.transactions[i].paymentMethod.name=== this.efectivo) {
              this.totalExpensesEfectivo+=this.transactions[i].ticket.total;            
            }
  
            if (this.transactions[i].paymentMethod.name===this.yape) {
              this.totalExpensesYape+=this.transactions[i].ticket.total;            
            }
          }          
        }
      });

  }

  totalCash(){  
    let valor;  
    let initImport:number;       
    valor =this.data.opening.openingBalance;
    initImport = parseFloat(valor);

    let res = initImport+this.totalIncome - this.totalExpenses;
    return res
  }

  totalIncomeType(){
    return this.totalIncomeIZIPAY +this.totalIncomeVisa + this.totalIncomeEfectivo + this.totalIncomeYape;
  }

  totalExpensesType(){
    return this.totalExpensesIZIPAY +this.totalExpensesVisa + this.totalExpensesEfectivo + this.totalExpensesYape;
  }

}
