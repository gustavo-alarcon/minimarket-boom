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
  selector: 'app-validated-return-dialog',
  templateUrl: './validated-return-dialog.component.html',
  styleUrls: ['./validated-return-dialog.component.scss']
})
export class ValidatedReturnDialogComponent implements OnInit {
  loading = new BehaviorSubject<boolean>(false);
  loading$ = this.loading.asObservable();

  validatedFormGroup: FormGroup;

  validatedAll$: Observable<boolean>

  retQuantity$: Observable<boolean>
  mermQuantity$: Observable<boolean>

  constructor(
    private dialogRef: MatDialogRef<ValidatedReturnDialogComponent>,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    private fb: FormBuilder,
    private af: AngularFirestore,
    @Inject(MAT_DIALOG_DATA) public data: { item: BuyRequestedProduct }
  ) { }

  ngOnInit(): void {

    this.validatedFormGroup = this.fb.group({
      inicial: this.data.item.returnedQuantity,
      mermaStock: 0,
      returned: 0
    })

    this.validatedFormGroup.get('inicial').disable()

    this.retQuantity$ = this.validatedFormGroup.get('returned').valueChanges.pipe(
      map(ret => {
        return this.data.item.returnedQuantity - this.validatedFormGroup.get('mermaStock').value < ret
      })
    )

    this.mermQuantity$ = this.validatedFormGroup.get('mermaStock').valueChanges.pipe(
      map(mer => {
        return this.data.item.returnedQuantity - this.validatedFormGroup.get('returned').value < mer
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
    let increase = this.data.item.returnedQuantity
    let decrease = this.validatedFormGroup.get('mermaStock').value + this.validatedFormGroup.get('returned').value
    return increase - decrease
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
          let prodFilter = products.filter(el => el.returned).map(el => {  
            let discount = this.validatedFormGroup.get('returned').value +  this.validatedFormGroup.get('mermaStock').value   
            if (el.id == this.data.item.id) {
              el.returnedValidated = this.data.item.validationData.returned == discount
              el.returnedQuantity = el.returnedQuantity - discount
            }
           
            return el
          })
          return {
            validated: prodFilter.reduce((a, b) => a && b.returnedValidated, true),
            returnedQuantity: prodFilter.reduce((a, b) => a + b.returnedQuantity, 0)
          }
        })
      )
    ).pipe(take(1)).subscribe(([user, res]) => {
      const ref = this.af.firestore.collection(`/db/distoProductos/productsList`).doc(this.data.item.id);
      this.af.firestore.runTransaction((transaction) => {
        return transaction.get(ref).then((prodDoc) => {
          let newStock = prodDoc.data().realStock + this.validatedFormGroup.value['returned'];
          let newMerma = prodDoc.data().mermaStock + this.validatedFormGroup.value['mermaStock'];
          let discount = this.validatedFormGroup.get('returned').value +  this.validatedFormGroup.get('mermaStock').value 

          transaction.update(ref, {
            mermaStock: newMerma,
            realStock: newStock
          })

          transaction.update(requestProductRef, {
            returnedQuantity: this.data.item.returnedQuantity - discount,
            returnedValidated: this.data.item.returnedQuantity == discount,
            returnedDate: this.data.item.returnedQuantity == discount ? new Date() : null
          })

          transaction.update(requestRef, {
            returnedQuantity: res.returnedQuantity,
            returnedValidated: res.validated,
            returnedDate: res.validated ? new Date() : null
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
