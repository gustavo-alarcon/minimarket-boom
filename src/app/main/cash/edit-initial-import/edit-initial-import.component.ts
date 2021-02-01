import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatabaseService } from '../../../core/services/database.service';
import { AuthService } from '../../../core/services/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-initial-import',
  templateUrl: './edit-initial-import.component.html',
  styleUrls: ['./edit-initial-import.component.scss']
})
export class EditInitialImportComponent implements OnInit {
 
  dataFormGroup: FormGroup  ;

  constructor(private fb: FormBuilder,
              private dialog: MatDialog,
              private dialogRef: MatDialogRef<EditInitialImportComponent>,
              public dbs: DatabaseService,
              public auth: AuthService,
              private afs: AngularFirestore, 
              private snackBar: MatSnackBar,       
              @Inject(MAT_DIALOG_DATA) public data:{idOpening,cashier,idCashBox} 
              ) { }

  ngOnInit(): void {

    this.dataFormGroup = this.fb.group({
      initialImport: ['', Validators.required],
      
    })
  }
  save(){
    const batch = this.afs.firestore.batch()
    const newOpeningBalanceRef = this.afs.firestore.collection(`/db/minimarketBoom/cashBox/${this.data.idCashBox}/openings`).doc(this.data.idOpening);

    let newOpeningBalance = {
      openingBalance: this.dataFormGroup.value['initialImport']
    }

    batch.update(newOpeningBalanceRef, newOpeningBalance)

    batch.commit()
    .then(() => {
      this.dialogRef.close();
      this.snackBar.open("se actualizo importe inicial", "Cerrar");         
    })
    .catch(err => {
      console.log(err);
      this.snackBar.open("Ups! parece que hubo un error ...", "Cerrar");
    })
  }

}
