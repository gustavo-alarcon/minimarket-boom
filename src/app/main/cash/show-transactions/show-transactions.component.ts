import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { DatabaseService } from '../../../core/services/database.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Transaction } from '../../../core/models/transaction.model';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-show-transactions',
  templateUrl: './show-transactions.component.html',
  styleUrls: ['./show-transactions.component.scss']
})
export class ShowTransactionsComponent implements OnInit {

  dataSourceCash = new MatTableDataSource();
  displayedColumnsCash: string[] = ['index','date','type', 'description','nTicket','import','payType','productList','actions'];

  @ViewChild("paginatorCash", { static: false }) set content(paginator: MatPaginator) {
    this.dataSourceCash.paginator = paginator;
  }
  constructor(
    private afs: AngularFirestore,    
    public dbs: DatabaseService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { idUserCash,idTransacion }) { }

  ngOnInit(): void {

    console.log('data : ',this.data)
    
    this.dbs.getTransactionsById(this.data.idUserCash,this.data.idTransacion).subscribe(
      (transaction:any) =>      
        {
             console.log(' this.openings : ', transaction);  
             this.dataSourceCash.data=transaction;     
        }
       );
    
  }

}
