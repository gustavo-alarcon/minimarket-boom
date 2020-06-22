import { Unit } from 'src/app/core/models/unit.model';
import { take, map, debounceTime, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/services/auth.service';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { BuyRequestedProduct } from './../../../../core/models/buy.model';
import { FormBuilder, FormGroup } from '@angular/forms';
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
    @Inject(MAT_DIALOG_DATA) public data: { item: BuyRequestedProduct, edit: true }
  ) { }

  ngOnInit(): void {

    if (this.data.edit) {
      this.validatedFormGroup = this.fb.group({
        mermaStock: this.data.item.validationData.mermaStock,
        returned: this.data.item.validationData.returned,
        observations: this.data.item.validationData.observations
      })

      if (this.data.item.returned) {
        if (this.data.item.returnedValidated) {
          this.validatedFormGroup.disable()
        }
      }
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

  edit() {
    const merStatic = this.data.item.validationData.mermaStock
    const returnStatic = this.data.item.validationData.returned

    let mermChange = this.validatedFormGroup.get('mermaStock').value
    let returnChange = this.validatedFormGroup.get('returned').value

    const stockStatic = this.data.item.quantity - (merStatic + returnStatic)
    if (merStatic != mermChange || returnStatic != returnChange) {
      let newMerm = mermChange - merStatic
      let newReturn = returnChange - returnStatic
      let newStock = this.getStock() - stockStatic

      this.editSave(newMerm, newReturn, newStock)

    } else {
      this.dialogRef.close()
    }

  }

  editSave(difMerm, difRet, difSt) {
    this.loading.next(true)
    this.validatedFormGroup.markAsPending();
    this.validatedFormGroup.disable()
    const requestRef = this.af.firestore.collection(`/db/distoProductos/buys`).doc(this.data.item.buyId);
    const requestProductRef = this.af.firestore.collection(`/db/distoProductos/buys/${this.data.item.buyId}/buyRequestedProducts`).doc(this.data.item.id);
    const ref = this.af.firestore.collection(`/db/distoProductos/productsList`).doc(this.data.item.id);

    this.dbs.getBuyRequestedProducts(this.data.item.buyId).pipe(
      map(products => {
        let prodFilter = products.map(el => {
          let count = 0
          if (el.id == this.data.item.id) {
            count = this.validatedFormGroup.get('returned').value
          } else {
            if (el.validationData) {
              count = el.validationData.returned
            }
          }
          return count
        })
        return {
          returnedQuantity: prodFilter.reduce((a, b) => a + b, 0)
        }
      }),
      take(1)
    ).subscribe(res => {
      this.af.firestore.runTransaction((transaction) => {
        return transaction.get(ref).then((prodDoc) => {
          let newStock = prodDoc.data().realStock + difSt;
          let newMerma = prodDoc.data().mermaStock + difMerm;
          transaction.update(ref, {
            realStock: newStock,
            mermaStock: newMerma
          });

          transaction.update(requestProductRef, {
            validatedDate: new Date(),
            validationData: this.validatedFormGroup.value,
            returned: this.validatedFormGroup.value['returned'] > 0,
            returnedQuantity: this.validatedFormGroup.value['returned']
          })

          transaction.update(requestRef, {
            returnedQuantity: res
          })

        });
      }).then(() => {
        this.loading.next(false)
        this.dialogRef.close()
        this.snackBar.open(
          'Producto editado',
          'Cerrar',
          { duration: 6000, }
        );

      })
    })

  }

  save() {
    this.loading.next(true)
    this.validatedFormGroup.markAsPending();
    this.validatedFormGroup.disable()
    const requestRef = this.af.firestore.collection(`/db/distoProductos/buys`).doc(this.data.item.buyId);
    const requestProductRef = this.af.firestore.collection(`/db/distoProductos/buys/${this.data.item.buyId}/buyRequestedProducts`).doc(this.data.item.id);

    combineLatest(
      this.auth.user$,
      this.dbs.getBuyRequestedProducts(this.data.item.buyId).pipe(
        map(products => {
          let prodFilter = products.map(el => {
            let count = 0
            if (el.id == this.data.item.id) {
              el.validated = true
              count = this.validatedFormGroup.get('returned').value
            }

            if (el.validationData && el.id != this.data.item.id) {
              count = el.validationData.returned
            }
            return {
              ...el,
              returnedQuantity: count
            }
          })
          return {
            validated: prodFilter.reduce((a, b) => a && b.validated, true),
            returnedQuantity: prodFilter.reduce((a, b) => a + b.returnedQuantity, 0)
          }
        })
      )
    ).pipe(take(1)).subscribe(([user, res]) => {
      const ref = this.af.firestore.collection(`/db/distoProductos/productsList`).doc(this.data.item.id);
      this.af.firestore.runTransaction((transaction) => {
        return transaction.get(ref).then((prodDoc) => {
          let newStock = prodDoc.data().realStock + this.getStock();
          let newMerma = prodDoc.data().mermaStock + this.validatedFormGroup.value['mermaStock'];

          transaction.update(ref, {
            realStock: newStock,
            mermaStock: newMerma
          })

          if (this.validatedFormGroup.value['returned'] == 0) {
            transaction.update(requestProductRef, {
              validated: true,
              validatedBy: user,
              validatedDate: new Date(),
              validationData: this.validatedFormGroup.value,
              validatedStatus: 'validado',
              returned: false,
              returnedQuantity: 0,
              returnedValidated: false
            })

            transaction.update(requestRef, {
              validated: res.validated,
              validatedDate: res.validated ? new Date() : null,
              editedDate: res.validated ? new Date() : null,
              editedBy: res.validated ? user : null,
            })
          } else {
            transaction.update(requestProductRef, {
              validationData: this.validatedFormGroup.value,
              validatedStatus: 'pendiente',
              returned: true,
              returnedQuantity: this.validatedFormGroup.value['returned'],
              returnedValidated: false,
              returnedStatus: 'por validar',
            })

            transaction.update(requestRef, {
              returned: res.returnedQuantity > 0,
              returnedQuantity: res.returnedQuantity,
              returnedValidated: false,
              status:'pendiente',
              editedDate: res.validated ? new Date() : null,
              editedBy: res.validated ? user : null,
            })
          }



        });
      }).then(() => {
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
