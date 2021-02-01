import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from '../../../core/services/database.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { type } from 'os';
import { Ticket } from '../../../core/models/ticket.model';

@Component({
  selector: 'app-add-money-cash-confirm',
  templateUrl: './add-money-cash-confirm.component.html',
  styleUrls: ['./add-money-cash-confirm.component.scss']
})
export class AddMoneyCashConfirmComponent implements OnInit {

  uploading: boolean = false;
  
  flags = {
    added: false
  }

  constructor(
    private afs: AngularFirestore,    
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialogRef: MatDialogRef<AddMoneyCashConfirmComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { form: any }
  ) { }

  ngOnInit(): void {
  }

  add(): void {
    this.uploading = true;
    
      this.auth.user$.pipe(take(1)).subscribe(user => {    
              
        const batch = this.afs.firestore.batch()
        const transactionRef = this.afs.firestore.collection(`/db/minimarketBoom/cashBox/${user.currentCash.uid}/openings/${user.currentCash.currentOpening}/transactions`).doc();
        
        let newTicket:Ticket = {
          index:null,
          productList:null,
          total:this.data.form.import
        }        

        const data = {
          uid: transactionRef.id,
          createdAt:new Date(),
          description: this.data.form.description,
          import: this.data.form.import,
          responsable: this.data.form.responsable,
          paymentMethod: this.data.form.paymentType,
          incomeType: this.data.form.incomeType,
          type:this.data.form.incomeType,
          expensesType:null,
          lastEditBy: null,
          ticket :newTicket,
          approvedBy:user,
          movementType:'Ingreso',

        }
  
        batch.set(transactionRef, data)
  
        batch.commit()
        .then(() => {
          this.dialogRef.close();
          this.snackBar.open("se agrego dinero", "Cerrar");
        })
        .catch(err => {
          console.log(err);
          this.snackBar.open("Ups! parece que hubo un error ...", "Cerrar");
        })
        
      })
  }

}
