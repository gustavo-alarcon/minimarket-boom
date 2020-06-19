import { Unit } from 'src/app/core/models/unit.model';
import { Buy } from 'src/app/core/models/buy.model';
import { take, map, debounceTime, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { BuyRequestedProduct } from './../../../../core/models/buy.model';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
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

  validatedAll$: Observable<boolean>

  retQuantity$: Observable<boolean>
  mermQuantity$: Observable<boolean>

  constructor(
    private dialogRef: MatDialogRef<ValidatedDialogComponent>,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private fb: FormBuilder,
    private af: AngularFirestore,
    @Inject(MAT_DIALOG_DATA) public data: { item: BuyRequestedProduct, edit: true, buy: Buy }
  ) { }

  ngOnInit(): void {
    const buyId: string = this.data.item.buyId

    this.validatedAll$ = this.dbs.getBuyRequestedProducts(buyId).pipe(
      map(products => {
        return products.reduce((a, b) => a && b.validated, true)
      }),
      take(1)
    )

    if (this.data.edit) {
      this.validatedFormGroup = this.fb.group({
        mermaStock: this.data.item.validationData.mermaStock,
        returned: this.data.item.validationData.returned,
        observations: [this.data.item.validationData.observations, [Validators.required]]
      })
    } else {
      this.validatedFormGroup = this.fb.group({
        mermaStock: 0,
        returned: 0,
        observations: null
      })
    }

    this.retQuantity$ = this.validatedFormGroup.get('returned').valueChanges.pipe(
      map(ret => {
        return this.data.item.quantity - this.validatedFormGroup.get('mermaStock').value < ret
      })
    )

    this.mermQuantity$ = this.validatedFormGroup.get('mermaStock').valueChanges.pipe(
      map(mer => {
        return this.data.item.quantity - this.validatedFormGroup.get('returned').value < mer
      })
    )

  }

  getUnit(unit: Unit, show: boolean) {
    if (show) {
      if (unit.weight == 1) {
        return unit.weight + ' ' + unit.abbreviation
      } else {
        return '(' + unit.weight + ' ' + unit.abbreviation.split(' ')[1] + ')'
      }
    } else {
      if (unit.weight == 1) {
        return unit.abbreviation
      } else {
        return '(' + unit.abbreviation + ')'
      }
    }

  }


  getStock() {
    let increase = this.data.item.quantity
    let decrease = this.validatedFormGroup.get('mermaStock').value + this.validatedFormGroup.get('returned').value
    return increase - decrease
  }

  save() {
    this.loading.next(true)
    this.validatedFormGroup.markAsPending();
    this.validatedFormGroup.disable()
    const requestRef = this.af.firestore.collection(`/db/distoProductos/buys`).doc(this.data.item.buyId);
    const requestProductRef = this.af.firestore.collection(`/db/distoProductos/buys/${this.data.item.buyId}/buyRequestedProducts`).doc(this.data.item.id);
    const batch = this.af.firestore.batch()

    this.auth.user$.pipe(
      take(1)
    ).subscribe(user => {
      batch.update(requestProductRef, {
        validated: true,
        validatedBy: user,
        validatedDate: new Date(),
        validationData: this.validatedFormGroup.value,
        returned: this.validatedFormGroup.value['returned'] > 0,
        returnedData: {
          returned: this.validatedFormGroup.value['returned'],
          observations: this.validatedFormGroup.value['observations']
        }
      })
      /*
      if (this.validatedFormGroup.value['returned'] > 0) {
        batch.update(requestRef, {
          returned: true,
          returnedData: {
            returned: this.validatedFormGroup.value['returned'],
            observations: this.validatedFormGroup.value['observations']
          }
        })
      }*/
      batch.commit().then(() => {
        this.validatedAll$.subscribe(res => {
          const ref = this.af.firestore.collection(`/db/distoProductos/productsList`).doc(this.data.item.id);
          this.af.firestore.runTransaction((transaction) => {
            return transaction.get(ref).then((prodDoc) => {
              let newStock = prodDoc.data().realStock + this.getStock();
              let newMerma = prodDoc.data().mermaStock + this.validatedFormGroup.value['mermaStock'];
              transaction.update(ref, {
                realStock: newStock,
                mermaStock: newMerma
              });
              transaction.update(requestRef, {
                validated: res
              })
            });
          }).then(() => {
            this.loading.next(false)
            this.dialogRef.close()
            this.snackBar.open(
              'Producto validado',
              'Cerrar',
              { duration: 6000, }
            );

          })
        })

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
