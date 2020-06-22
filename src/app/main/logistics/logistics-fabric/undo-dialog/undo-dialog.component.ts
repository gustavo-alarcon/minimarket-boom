import { take, map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { BuyRequestedProduct } from './../../../../core/models/buy.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatabaseService } from './../../../../core/services/database.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-undo-dialog',
  templateUrl: './undo-dialog.component.html',
  styleUrls: ['./undo-dialog.component.scss']
})
export class UndoDialogComponent implements OnInit {
  loading = new BehaviorSubject<boolean>(false);
  loading$ = this.loading.asObservable();
  constructor(
    private dialogRef: MatDialogRef<UndoDialogComponent>,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    private af: AngularFirestore,
    @Inject(MAT_DIALOG_DATA) public data: { item: BuyRequestedProduct, status: 'string' }) { }

  ngOnInit(): void {
  }

  undoValidated(product: BuyRequestedProduct) {
    this.loading.next(true)
    const requestRef = this.af.firestore.collection(`/db/distoProductos/buys`).doc(product.buyId);
    const requestProductRef = this.af.firestore.collection(`/db/distoProductos/buys/${product.buyId}/buyRequestedProducts`).doc(product.id);
    const productRef = this.af.firestore.collection(`/db/distoProductos/productsList`).doc(product.id);
    let quantity = product.quantity - (product.validationData.mermaStock + product.validationData.returned)

    let returnAll$ = this.dbs.getBuyRequestedProducts(product.buyId).pipe(
      map(products => {
        let prodFilter = products.map(el => {
          let count = 0
          if (el.id == product.id) {
            el.returned = false
          }
          if (el.validationData && el.id != product.id) {
            count = el.validationData.returned
          }
          return {
            ...el,
            returnedQuantity: count
          }
        })
        return {
          returned: prodFilter.reduce((a, b) => a || b.returned, false),
          returnedQuantity: prodFilter.reduce((a, b) => a + b.returnedQuantity, 0)
        }
      }),
      take(1)
    )

    returnAll$.subscribe(res => {

      this.af.firestore.runTransaction((transaction) => {
        return transaction.get(productRef).then((prodDoc) => {
          let newStock = prodDoc.data().realStock - quantity;
          let newMerma = prodDoc.data().mermaStock - product.validationData.mermaStock;

          transaction.update(productRef, {
            realStock: newStock,
            mermaStock: newMerma
          });

          transaction.update(requestRef, {
            validated: false,
            validatedDate: null,
            returned: res.returned,
            returnedQuantity: res.returnedQuantity,
            status: res.returned ? 'pendiente' : 'por validar'
          })

          transaction.update(requestProductRef, {
            validatedStatus: 'por validar',
            validated: false,
            validationData: null,
            returned: false,
            returnedStatus: 'por validar'
          })

        });
      }).then(() => {
        this.dialogRef.close()
        this.snackBar.open(
          'Cambios guardados',
          'Cerrar',
          { duration: 6000, }
        );
        this.loading.next(false)

      }).catch(function (error) {
        console.log("Transaction failed: ", error);
        this.snackBar.open(
          'Ocurrió un problema',
          'Cerrar',
          { duration: 6000, }
        );
      });
    })


  }

}
