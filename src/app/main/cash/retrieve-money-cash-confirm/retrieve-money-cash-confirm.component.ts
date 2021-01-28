import { Component, OnInit, Inject } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { DatabaseService } from '../../../core/services/database.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-retrieve-money-cash-confirm',
  templateUrl: './retrieve-money-cash-confirm.component.html',
  styleUrls: ['./retrieve-money-cash-confirm.component.scss']
})
export class RetrieveMoneyCashConfirmComponent implements OnInit {

  uploading: boolean = false;
  
  flags = {
    added: false
  }

  constructor(
    private afs: AngularFirestore,    
    public dbs: DatabaseService,
    public auth: AuthService,
    private dialogRef: MatDialogRef<RetrieveMoneyCashConfirmComponent>,
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
  
        const data = {
          uid: transactionRef.id,
          regDate: Date.now(),
          description: this.data.form.description,
          import: this.data.form.import,
          responsable: this.data.form.responsable,
          paymentType: this.data.form.paymentType,
          expensesType: this.data.form.expensesType,
          incomeType:null,
          lastEditBy: null,
          nTicket :null,
          approvedBy:user,
          movementType:'expenses'

        }
  
        batch.set(transactionRef, data)
  
        batch.commit()
        .then(() => {
          this.dialogRef.close();
          this.snackBar.open("se retiro dinero", "Cerrar");
        })
        .catch(err => {
          console.log(err);
          this.snackBar.open("Ups! parece que hubo un error ...", "Cerrar");
        })
        
      })
  }
}
