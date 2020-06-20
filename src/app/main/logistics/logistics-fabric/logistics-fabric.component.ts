import { AngularFirestore } from '@angular/fire/firestore';
import { BuyRequestedProduct } from './../../../core/models/buy.model';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Buy } from 'src/app/core/models/buy.model';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { RequestCreateEditComponent } from './request-create-edit/request-create-edit.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatabaseService } from 'src/app/core/services/database.service';
import { Observable, combineLatest, forkJoin, BehaviorSubject } from 'rxjs';
import { switchMap, startWith, map, tap, concatMap, concatAll, take } from 'rxjs/operators';
import { ValidatedDialogComponent } from './validated-dialog/validated-dialog.component';

@Component({
  selector: 'app-logistics-fabric',
  templateUrl: './logistics-fabric.component.html',
  styleUrls: ['./logistics-fabric.component.scss']
})
export class LogisticsFabricComponent implements OnInit {
  buyList$: Observable<Buy[]>
  filter$: Observable<Buy[]>

  loading = new BehaviorSubject<boolean>(true);
  loading$ = this.loading.asObservable();

  loadingUndo: string = 'F'


  statusOptions = [
    "Todos", 'Pendiente', 'Validado'
  ]

  panelOpenState: boolean[] = [];

  dateFormControl: FormControl;
  statusFormControl: FormControl;
  searchFormControl: FormControl;

  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['name', 'amount', 'date', 'unitPrice', 'totalPrice', 'validate'];

  p: number = 1;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private af: AngularFirestore,
    private dbs: DatabaseService
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.initObservables();
  }

  initForms() {
    const view = this.dbs.getCurrentMonthOfViewDate();

    let beginDate = view.from;
    let endDate = new Date();
    endDate.setHours(23, 59, 59);

    this.dateFormControl = new FormControl({
      begin: beginDate,
      end: endDate
    })

    this.statusFormControl = new FormControl("Todos")
    this.searchFormControl = new FormControl("")

  }

  initObservables() {
    const view = this.dbs.getCurrentMonthOfViewDate();

    let beginDate = view.from;
    let endDate = new Date();
    endDate.setHours(23, 59, 59);

    this.buyList$ = this.dateFormControl.valueChanges.pipe(
      startWith<{ begin: Date, end: Date }>({ begin: beginDate, end: endDate }),
      map(({ begin, end }) => {
        begin.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59);
        return { begin, end }
      }),
      switchMap((res) => {
        return this.dbs.getBuyRequests(res).pipe(
          map((buy, i) => {
            return buy.map(el => {
              return {
                ...el,
                products: this.dbs.getBuyRequestedProducts(el.id),
                onevalidated$: this.dbs.getBuyRequestedProducts(el.id).pipe(
                  map(prod => prod.reduce((a, b) => a || b.validated, false))
                )
              }
            })
          })
        )
      }),
    )

    this.filter$ = combineLatest(this.buyList$,
      this.statusFormControl.valueChanges.pipe<string>(startWith(this.statusFormControl.value)),
      this.searchFormControl.valueChanges.pipe<string>(startWith(this.searchFormControl.value))
    ).pipe(
      map(([buyList, status, search]) => {
        let buyFiltered = buyList.filter(buyReq => {
          switch (status) {
            case "Todos":
              return !search ? buyReq :
                buyReq.correlative.toString().padStart(6).includes(String(search))
            case 'Pendiente':
              return !search ? buyReq.validated == false : (
                buyReq.correlative.toString().padStart(6).includes(String(search)) &&
                buyReq.validated == false
              )
            case 'Validado':
              return !search ? buyReq.validated == true : (
                buyReq.correlative.toString().padStart(6).includes(String(search)) &&
                buyReq.validated == true
              )
          }
        })
        return buyFiltered
      }),
      tap(res => {
        this.loading.next(false)
        res.forEach(el => {
          this.panelOpenState.push(false);
        })
      })
    )
  }

  onCreateEditRequest(edit: boolean, request: Request) {
    let dialogRef: MatDialogRef<RequestCreateEditComponent>;
    if (edit == true) {
      dialogRef = this.dialog.open(RequestCreateEditComponent, {
        minWidth: '400px',
        autoFocus: false,
        data: {
          data: request,
          edit: edit
        }
      });
      dialogRef.afterClosed().subscribe(res => {
        switch (res) {
          case true:
            this.snackBar.open('La solicitud fue editada satisfactoriamente', 'Aceptar', { duration: 5000 });
            break;
          case false:
            this.snackBar.open('Ocurrió un error. Por favor, vuelva a intentarlo', 'Aceptar', { duration: 5000 });
            break;
          default:
            break;
        }
      })
    }
    else {
      dialogRef = this.dialog.open(RequestCreateEditComponent, {
        minWidth: '400px',
        data: {
          data: null,
          edit: edit
        }
      });
      dialogRef.afterClosed().subscribe(res => {
        switch (res) {
          case true:
            this.snackBar.open('La solicitud fue creada satisfactoriamente', 'Aceptar', { duration: 5000 });
            break;
          case false:
            this.snackBar.open('Ocurrió un error. Por favor, vuelva a intentarlo', 'Aceptar', { duration: 5000 });
            break;
          default:
            break;
        }
      })
    }
  }

  validated(product: BuyRequestedProduct, isedit: boolean) {
    this.dialog.open(ValidatedDialogComponent, {
      data: {
        item: product,
        edit: isedit
      }
    })
  }


  isloading(buyind, ind) {
    let cod = 'F' + buyind + ind
    return cod == this.loadingUndo
  }

  undoValidated(product: BuyRequestedProduct, buyind, ind) {
    this.loadingUndo = 'F' + buyind + ind
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
            returnedQuantity: res.returnedQuantity
          })

          transaction.update(requestProductRef, {
            validated: false,
            validatedBy: null,
            validatedDate: null,
            validationData: null,
            returned: false
          })



        });
      }).then(() => {
        this.loadingUndo = 'F'
        this.snackBar.open(
          'Cambios guardados',
          'Cerrar',
          { duration: 6000, }
        );

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
