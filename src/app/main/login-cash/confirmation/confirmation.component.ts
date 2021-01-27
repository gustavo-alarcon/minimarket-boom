import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CashBox } from '../../../core/models/cashBox.model';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DatabaseService } from '../../../core/services/database.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {

  uploading: boolean = false;

  constructor(
      public dbs: DatabaseService,
      public auth: AuthService,
      private afs: AngularFirestore,    
      private dialogRef: MatDialogRef<ConfirmationComponent>,
      private snackBar: MatSnackBar,    
      private router: Router,
      @Inject(MAT_DIALOG_DATA) public data: { cashBox:CashBox ,openingBalance:number},
  ) { }

  ngOnInit(): void {
    
  }
  
  openCash(){
    this.uploading = true;
    this.auth.user$.pipe(take(1)).subscribe(user => {    
            
      // update cashBox
      const batch = this.afs.firestore.batch()
      const cashBoxRef = this.afs.firestore.collection(`/db/minimarketBoom/cashBox`).doc(this.data.cashBox.uid);

      const updateCashBox = {
        currentOwner: user,
        open: true,
        lastOpening: Date.now()
      }

      batch.update(cashBoxRef, updateCashBox)

      batch.commit()
      .then(() => {
        this.dialogRef.close(true);
        this.snackBar.open("Caja fue editado!", "Cerrar");
        this.createOpening(updateCashBox.lastOpening,user);
      })
      .catch(err => {
        console.log(err);
        this.snackBar.open("Ups! parece que hubo un error ...", "Cerrar");
      })
      
    }) 
    
  }

  createOpening(lastOpening,user){
    //add collection opening
   
      const batch = this.afs.firestore.batch()  
      const openingRef = this.afs.firestore.collection(`/db/minimarketBoom/cashBox/${this.data.cashBox.uid}/openings`).doc();

      const openingData = {
        uid: openingRef.id,
        openedBy: user,
        closedBy: null,
        openingDate:lastOpening,
        closureDate: null,
        openingBalance: this.data.openingBalance,
        closureBalance: null,
        importAdded: null,
        importWithdrawn: null,
        cashCount: null,
        detailMoneyDistribution:null,
      }      

        batch.set(openingRef, openingData)

        batch.commit().then(() => {
          //this.loading.next(false)
          this.dialogRef.close();
          this.snackBar.open('se creo opening', 'Cerrar', { duration: 5000 });
          this.updateUserCashBox(openingRef.id ,user);
        }) 
        .catch(err => {
          console.log(err);
          this.snackBar.open("Ups! parece que hubo un error ...", "Cerrar");
        }) 
  }

  updateUserCashBox(idOpening,user){
    // update cashBox
    const batch = this.afs.firestore.batch()
    const cashBoxRef = this.afs.firestore.collection(`/db/minimarketBoom/cashBox`).doc(this.data.cashBox.uid);

    let currentData = {
      currentOpening: idOpening
    }

    batch.update(cashBoxRef, currentData)

    batch.commit()
    .then(() => {
      this.dialogRef.close();
      this.snackBar.open("Caja abierta :D !", "Cerrar");    

      this.addCurrentCashUser(user);      
     
    })
    .catch(err => {
      console.log(err);
      this.snackBar.open("Ups! parece que hubo un error ...", "Cerrar");
    })

  }
  addCurrentCashUser(user){
   
    this.dbs.loginCash(this.data.cashBox.cashier,this.data.cashBox.password).pipe(take(1))
    .subscribe(userCashBox=> {

      console.log('userCashBox: ', userCashBox);
      let currentCashBox:CashBox = userCashBox['0']; 
      const batch = this.afs.firestore.batch()
      const userRef = this.afs.firestore.collection(`/users`).doc(user.uid);

      const updateUser = {
        currentCash: currentCashBox
      }

      batch.update(userRef, updateUser)

      batch.commit()
      .then(() => {

        this.router.navigateByUrl('main/cash');
        this.dialogRef.close();
       
      })
      .catch(err => {
        
      })
    })
  }

}
