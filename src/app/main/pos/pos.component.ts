import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { FormControl } from '@angular/forms';
import { DatabaseService } from 'src/app/core/services/database.service';
import { Ticket } from 'src/app/core/models/ticket.model';
import { Product } from 'src/app/core/models/product.model';
import { tap } from 'rxjs/internal/operators/tap';
import { MatDialog } from '@angular/material/dialog';
import { PosQuantityComponent } from './pos-quantity/pos-quantity.component';
import { take, startWith, map } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { PosFinishComponent } from './pos-finish/pos-finish.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Platform } from '@angular/cdk/platform';
import { AngularFirestore } from '@angular/fire/firestore';
import { PosUnknownProductComponent } from './pos-unknown-product/pos-unknown-product.component';
import { LocalStorageService } from 'angular-2-local-storage';
import { PosTicketComponent } from './pos-ticket/pos-ticket.component';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss'],
})
export class PosComponent implements OnInit {

  displayedColumns: string[] = ['product', 'price', 'quantity', 'total', 'actions'];
  dataSource = new MatTableDataSource<{ product: Product, quantity: number }>();

  selected = new FormControl(0);
  search = new FormControl('');

  productList$: Observable<Array<Product>>;
  productList: Array<Product> = [];

  options$: Observable<Array<Product>>;

  // tickets$: Observable<Array<Ticket>>;
  tickets: Array<Ticket> = [];
  ticketsKey: string;

  loading = new BehaviorSubject<boolean>(false);
  loading$ = this.loading.asObservable();

  constructor(
    public auth: AuthService,
    public dbs: DatabaseService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private af: AngularFirestore,
    public platform: Platform,
    private lss: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.dbs.changeTitle('Punto de Venta');

    this.productList$ =
      this.dbs.getProductsListValueChanges()
        .pipe(
          tap(res => {
            if (res) {
              this.productList = res;
            }
          })
        )

    this.options$ = combineLatest(
      this.search.valueChanges.pipe(startWith('')),
      this.productList$
    ).pipe(
      map(([search, productList]) => {
        let term: string = search.toString().toLowerCase().trim();
        if (term === '') {
          return []
        } else {
          let options = productList.filter(el => el.description.toLowerCase().includes(term) || el.sku.toLowerCase().includes(term));
          return options
        }
      })
    )

    // Getting tickets from local storage based in user uid
    this.auth.user$
      .pipe(take(1))
      .subscribe(user => {
        if (user) {
          this.ticketsKey = 'tickets-' + user.uid;
          this.tickets = this.lss.get(this.ticketsKey) ? this.lss.get(this.ticketsKey) : [];
          this.dataSource.data = this.tickets.length > 0 ? this.tickets[this.selected.value].productList : [];

          // Get current index
          if (this.tickets.length) {
            let idx = 0;
            this.tickets.forEach(el => {
              if (el.index > idx) {
                idx = el.index
              }
            });
            this.dbs.tabCounter = idx;
          }

        } else {
          this.ticketsKey = null;
        }

      })

  }

  print() {
    this.dialog.open(PosTicketComponent, {
      data: this.tickets[this.selected.value],
      width: '250px',
    });
  }

  showOption(product: Product): string | null {
    return product.sku ? product.sku : null;
  }

  playSuccessAudio() {
    let audio = new Audio();
    audio.src = "../../../assets/audio/good.mp3";
    audio.load();
    audio.play();
  }

  playErrorAudio() {
    let audio = new Audio();
    audio.src = "../../../assets/audio/bad.mp3";
    audio.load();
    audio.play();
  }

  setTab(index: number): void {
    this.selected.setValue(index);
    if (this.tickets.length > 0) {
      this.dataSource.data = this.tickets[this.selected.value].productList;
    }
  }

  addTicket() {
    if (!this.ticketsKey) return;

    this.loading.next(true);

    this.dbs.tabCounter++;

    let newTicket: Ticket = {
      index: this.dbs.tabCounter,
      productList: [],
      total: 0
    }

    this.tickets.push(newTicket);

    this.selected.setValue(this.tickets.length - 1);

    this.dataSource.data = this.tickets[this.selected.value].productList;

    this.lss.set(this.ticketsKey, this.tickets);

    this.snackbar.open("Ticket listo!", "Aceptar", {
      duration: 3000
    });

    this.loading.next(false);
  }

  removeTicket(index: number) {
    if (!this.ticketsKey) return;
    this.loading.next(true);

    // removing ticket from list
    this.tickets.splice(index, 1);
    if (this.tickets.length > 0) {
      this.selected.setValue(this.tickets.length - 1);
    }

    this.snackbar.open("Ticket borrado", "Aceptar", {
      duration: 3000
    });

    this.lss.set(this.ticketsKey, this.tickets);
    this.loading.next(false);
  }

  finishTicket(): void {
    if (!this.ticketsKey) return;

    if (this.tickets[this.selected.value].productList.length < 1) {
      return
    }

    this.dialog.open(PosFinishComponent, {
      data: this.tickets[this.selected.value]
    }).afterClosed()
      .pipe(
        take(1),
        tap(res => {
          if (res) {
            this.snackbar.open("Ticket finalizado exitosamente!", "Aceptar", {
              duration: 6000
            });

            this.tickets[this.selected.value].status = 'Pagado';

            this.removeTicket(this.selected.value);
            this.addTicket();
          } else {
            this.snackbar.open('Reintentar ticket en VENTAS TIENDA!', 'Aceptar', {
              duration: 4000
            });
            this.removeTicket(this.selected.value);
            this.addTicket();
          }
        })
      ).subscribe()
  }

  addProduct(): void {
    if (!this.ticketsKey) return;

    // Adding new ticket if there is no one
    if (this.tickets.length === 0) {
      this.snackbar.open("Agregando nuevo ticket", "Aceptar", {
        duration: 6000
      });

      this.addTicket();

      setTimeout(() => {
        this.addProduct();
      }, 300);

      return;
    }

    // Checking if search field has something to compare
    if (!this.search.value) {
      this.snackbar.open("Debe escanear o escribir el código/nombre del producto", "Aceptar", {
        duration: 6000
      });
      return;
    }

    // search if product already exist in basket
    let foundIndex = -1;
    let basketArray = this.tickets[this.selected.value].productList;

    let search = this.search.value.sku ? this.search.value.sku : this.search.value;

    // Loop over to find the index if product already exist
    for (let i = 0; i < basketArray.length; i++) {
      if (basketArray[i].product.sku === search) {
        foundIndex = i;
        break;
      }
    }

    if (foundIndex > -1) {
      // Ok, is already in basket, just add one more
      if (basketArray[foundIndex].product.saleType !== '2') {
        basketArray[foundIndex].quantity++;

        // Update total ticket price
        this.updateTicketPrice();

        // Clean search input
        this.search.setValue('');

        this.snackbar.open("Producto agregado", "Aceptar", {
          duration: 3000
        });
        this.lss.set(this.ticketsKey, this.tickets);
        this.playSuccessAudio();
        this.loading.next(false);

      } else {
        this.dialog.open(PosQuantityComponent)
          .afterClosed()
          .pipe(take(1))
          .subscribe(qty => {
            if (qty) {
              basketArray[foundIndex].quantity = basketArray[foundIndex].quantity + qty;

              // Update total ticket price
              this.updateTicketPrice();

              // Clean search input
              this.search.setValue('');

              this.snackbar.open("Producto agregado", "Aceptar", {
                duration: 3000
              });
              this.lss.set(this.ticketsKey, this.tickets);
              this.playSuccessAudio();
              this.loading.next(false);

            }
          })
      }

    } else {
      // Let's put one in the basket
      // search for sku in product list
      let productResult = this.productList.filter(el => el.sku === search);

      if (productResult.length > 0) {

        if (productResult[0].saleType !== '2') {
          // Push product first in the list
          this.tickets[this.selected.value].productList.unshift({ product: productResult[0], quantity: 1 });

          // Update total ticket price
          this.updateTicketPrice();

          // Update data table
          this.dataSource.data = this.tickets[this.selected.value].productList;

          // Clean search input
          this.search.setValue('');

          this.snackbar.open("Producto agregado", "Aceptar", {
            duration: 3000
          });
          this.lss.set(this.ticketsKey, this.tickets);
          this.playSuccessAudio();
          this.loading.next(false);

        } else {
          this.dialog.open(PosQuantityComponent)
            .afterClosed()
            .pipe(take(1))
            .subscribe(qty => {
              if (qty) {
                // Push product first in the list
                this.tickets[this.selected.value].productList.unshift({ product: productResult[0], quantity: qty });

                // Update total ticket price
                this.updateTicketPrice();

                // Update data table
                this.dataSource.data = this.tickets[this.selected.value].productList;

                // Clean search input
                this.search.setValue('');

                this.snackbar.open("Producto agregado", "Aceptar", {
                  duration: 3000
                });
                this.lss.set(this.ticketsKey, this.tickets);
                this.playSuccessAudio();
                this.loading.next(false);
              }

            })
        }

      } else {
        this.snackbar.open("Producto NO REGISTRADO", "Aceptar", {
          duration: 4000
        });
        this.playErrorAudio();
        this.dialog.open(PosUnknownProductComponent, {
          data: {
            sku: search
          }
        }).afterClosed()
          .pipe(take(1))
          .subscribe(res => {
            if (res) {
              if (res.product) {
                setTimeout(() => {
                  this.addProduct();
                }, 1000);
              } else {
                let product = {
                  id: null,
                  description: search,
                  price: res.price,
                  sku: search,
                  category: null,
                  unit: null,
                  realStock: null,
                  mermaStock: null,
                  sellMinimum: null,
                  alertMinimum: null,
                  photoURL: null,
                  photoPath: null,
                  promo: null,
                  createdAt: null,
                  createdBy: null,
                  editedAt: null,
                  editedBy: null
                }

                this.tickets[this.selected.value].productList.unshift({ product: product, quantity: res.quantity });

                // Update total ticket price
                this.updateTicketPrice();
                // Update data table
                this.dataSource.data = this.tickets[this.selected.value].productList;
                // clean input
                this.search.setValue('');

                this.snackbar.open("Producto agregado", "Aceptar", {
                  duration: 3000
                });
                this.lss.set(this.ticketsKey, this.tickets);
                this.playSuccessAudio();
                this.loading.next(false);
              }

            }
            // clean input
            this.search.setValue('');
          })

        return;
      }
    }
  }

  editItem(index: number): void {
    if (!this.ticketsKey) return;

    this.dialog.open(PosQuantityComponent)
      .afterClosed()
      .pipe(
        take(1),
        tap(qty => {
          if (qty) {
            this.tickets[this.selected.value].productList[index].quantity = qty;

            this.updateTicketPrice();

            this.dataSource.data = this.tickets[this.selected.value].productList;
          }
        })
      ).subscribe()
  }

  updateTicketPrice(): void {
    if (!this.ticketsKey) return;

    let total = 0;

    this.tickets[this.selected.value].productList.forEach(el => {
      total = total + (el.quantity * el.product.price);
    });

    this.tickets[this.selected.value].total = total;
  }

  checkStock(product: Product, isAdding: boolean): boolean {
    if (isAdding) {
      let actualStock
    }

    return
  }

  addQuantity(index: number): void {
    if (!this.ticketsKey) return;

    this.loading.next(true);

    if (this.tickets[this.selected.value].productList[index].product.saleType !== '2') {
      // Add product's quantity
      this.tickets[this.selected.value].productList[index].quantity++;

      // Update total ticket price
      this.updateTicketPrice();

      this.snackbar.open("Producto agregado", "Aceptar", {
        duration: 3000
      });
      this.lss.set(this.ticketsKey, this.tickets)
      this.loading.next(false);

    } else {
      this.dialog.open(PosQuantityComponent)
        .afterClosed()
        .pipe(take(1))
        .subscribe(qty => {
          if (qty) {
            // Add product's quantity
            this.tickets[this.selected.value].productList[index].quantity = this.tickets[this.selected.value].productList[index].quantity + qty;

            // Update total ticket price
            this.updateTicketPrice();

            this.snackbar.open("Producto agregado", "Aceptar", {
              duration: 3000
            });
            this.lss.set(this.ticketsKey, this.tickets);
            this.loading.next(false);
          }

        })
    }
  }

  removeQuantity(index: number): void {
    if (!this.ticketsKey) return;

    this.loading.next(true);

    if (this.tickets[this.selected.value].productList[index].product.saleType !== '2') {
      // Add product's quantity
      this.tickets[this.selected.value].productList[index].quantity--;
      // Update total ticket price
      this.updateTicketPrice();

      this.snackbar.open("Producto restado", "Aceptar", {
        duration: 3000
      });
      this.lss.set(this.ticketsKey, this.tickets);
      this.loading.next(false);

    } else {
      this.dialog.open(PosQuantityComponent)
        .afterClosed()
        .pipe(take(1))
        .subscribe(qty => {

          if (qty) {
            // Add product's quantity
            this.tickets[this.selected.value].productList[index].quantity = this.tickets[this.selected.value].productList[index].quantity - qty;

            // Update total ticket price
            this.updateTicketPrice();

            this.snackbar.open("Producto restado", "Aceptar", {
              duration: 3000
            });
            this.lss.set(this.ticketsKey, this.tickets);
            this.loading.next(false);
          }

        })
    }
  }

  removeItem(index: number): void {
    if (!this.ticketsKey) return;

    this.loading.next(true);

    this.tickets[this.selected.value].productList.splice(index, 1);

    this.dataSource.data = this.tickets[this.selected.value].productList;

    // Update total ticket price
    this.updateTicketPrice();

    this.snackbar.open("Producto retirado", "Aceptar", {
      duration: 3000
    });
    this.lss.set(this.ticketsKey, this.tickets)
    this.loading.next(false);
  }

}
