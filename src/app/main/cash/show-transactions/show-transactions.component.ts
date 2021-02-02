import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { DatabaseService } from '../../../core/services/database.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ShowDescriptionComponent } from '../show-description/show-description.component';
import { ShowProductListComponent } from '../show-product-list/show-product-list.component';

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
    public dbs: DatabaseService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { idUserCash,idTransacion }) { }

  ngOnInit(): void {
    
    this.dbs.getTransactionsById(this.data.idUserCash,this.data.idTransacion).subscribe(
      (transaction:any) =>      
        {
             this.dataSourceCash.data=transaction;     
        }
       );
    
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

}
