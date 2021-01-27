import { Component, OnInit, Inject } from '@angular/core';
import { DatabaseService } from '../../../core/services/database.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';

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
      
        console.log('user confirm : ' , user);
        
        const batch = this.afs.firestore.batch()
        const transactionRef = this.afs.firestore.collection(`/db/minimarketBoom/cashBox/${user.currentCash.uid}/openings/${user.currentCash.currentOpening}/transactions`).doc();
  
        const data = {
          uid: transactionRef.id,
          regDate: Date.now(),
          description: this.data.form.description,
          import: this.data.form.import,
          responsable: this.data.form.responsable,
          paymentType: this.data.form.paymentType,
          incomeType: this.data.form.incomeType,
          lastEditBy: null,
          nTicket :null,
          approvedBy:user,
        }
  
        batch.set(transactionRef, data)
  
        batch.commit()
        .then(() => {
          this.dialogRef.close();
          this.snackBar.open("se creo la transacion", "Cerrar");
        })
        .catch(err => {
          console.log(err);
          this.snackBar.open("Ups! parece que hubo un error ...", "Cerrar");
        })
        
      })
  }

}
