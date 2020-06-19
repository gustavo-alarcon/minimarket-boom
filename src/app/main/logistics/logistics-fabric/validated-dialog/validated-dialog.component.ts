import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { BuyRequestedProduct } from './../../../../core/models/buy.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatabaseService } from './../../../../core/services/database.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-validated-dialog',
  templateUrl: './validated-dialog.component.html',
  styleUrls: ['./validated-dialog.component.scss']
})
export class ValidatedDialogComponent implements OnInit {
  loading = new BehaviorSubject<boolean>(false);
  loading$ = this.loading.asObservable();

  validatedFormGroup: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<ValidatedDialogComponent>,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private fb: FormBuilder,
    private af: AngularFirestore,
    @Inject(MAT_DIALOG_DATA) public data: { item: BuyRequestedProduct, edit: true }
  ) { }

  ngOnInit(): void {
    if (this.data.edit) {
      this.validatedFormGroup = this.fb.group({
        mermaStock: [this.data.item.validationData.mermaStock, [Validators.required]],
        returned: [this.data.item.validationData.returned, [Validators.required]],
        observations: [this.data.item.validationData.observations, [Validators.required]]
      })
    } else {
      this.validatedFormGroup = this.fb.group({
        mermaStock: [0, [Validators.required]],
        returned: [0, [Validators.required]],
        observations: [null, [Validators.required]]
      })
    }

  }

  save() {
    this.loading.next(true)
    this.validatedFormGroup.markAsPending();
    this.validatedFormGroup.disable()
    const requestRef = this.af.firestore.collection(`/db/distoProductos/buys/${this.data.item.buyId}/buyRequestedProducts`).doc(this.data.item.id);
    const batch = this.af.firestore.batch()

    this.auth.user$.pipe(
      take(1)
    ).subscribe(user => {
      batch.update(requestRef, {
        validated: true,
        validatedBy: user,
        validatedDate: new Date(),
        validationData: this.validatedFormGroup.value
      })
      batch.commit().then(() => {
        this.loading.next(false)
        this.dialogRef.close()
        this.snackBar.open(
          'Producto validado',
          'Cerrar',
          { duration: 6000, }
        );
      }).catch(error => {
        this.snackBar.open(
          'Ocurrió un error. Por favor, vuelva a intentarlo.',
          'Cerrar',
          { duration: 6000, }
        );
      })
    })

  }

}
