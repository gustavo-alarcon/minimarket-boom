import { Component, OnInit, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CashBox } from '../../../core/models/cashBox.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-delete-cash-box',
  templateUrl: './delete-cash-box.component.html',
  styleUrls: ['./delete-cash-box.component.scss']
})
export class DeleteCashBoxComponent implements OnInit {

  loading = new BehaviorSubject<boolean>(false);
  loading$ = this.loading.asObservable();

  deleteBox=true;

  constructor(
    private snackBar: MatSnackBar,
    private afs: AngularFirestore,     
    private dialogref: MatDialogRef<DeleteCashBoxComponent>,
    @Inject(MAT_DIALOG_DATA) public data:{ item: CashBox },
    ) { }

  ngOnInit(): void {
    
    if (this.data.item.state ==="Abierto") {

      this.deleteBox=false
      
    }
  }
  
  save() {   

    const batch = this.afs.firestore.batch()
    const cashBoxRef = this.afs.firestore.collection(`/db/minimarketBoom/cashBox`).doc(this.data.item.uid);

    batch.delete(cashBoxRef);

    batch.commit()
    .then(() => {
      this.loading.next(false)
      this.dialogref.close(true);
      this.snackBar.open("la caja fue eliminado!", "Cerrar");
    })
    .catch(err => {
      console.log(err);
      this.snackBar.open("Ups! parece que hubo un error ...", "Cerrar");
    })

  }
}
