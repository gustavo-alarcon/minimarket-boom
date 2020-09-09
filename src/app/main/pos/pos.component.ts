import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { FormControl } from '@angular/forms';
import { DatabaseService } from 'src/app/core/services/database.service';
import { Ticket } from 'src/app/core/models/ticket.model';
import { Product } from 'src/app/core/models/product.model';
import { tap } from 'rxjs/internal/operators/tap';
import { MatDialog } from '@angular/material/dialog';
import { PosQuantityComponent } from './pos-quantity/pos-quantity.component';
import { take } from 'rxjs/operators';
import { DataSource } from '@angular/cdk/table';
import { MatTableDataSource } from '@angular/material/table';
import { ProductConfigCategoriesComponent } from '../products-list/product-config-categories/product-config-categories.component';
import { PosFinishComponent } from './pos-finish/pos-finish.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Platform } from '@angular/cdk/platform';
import { isatty } from 'tty';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class PosComponent implements OnInit {

  displayedColumns: string[] = ['product', 'price', 'quantity', 'total', 'actions'];

  selected = new FormControl(0);
  search = new FormControl('');

  productList$: Observable<Array<Product>>;
  productList: Array<Product> = [];

  dataSource = new MatTableDataSource<{ product: Product, quantity: number }>();

  constructor(
    public auth: AuthService,
    public dbs: DatabaseService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.dbs.changeTitle('Punto de Venta');
    
    this.productList$ =
      this.dbs.getProductsList()
        .pipe(
          tap(res => {
            if (res) {
              this.productList = res;
            }
          })
        )

    this.dataSource.data = this.dbs.tabs[this.selected.value].productList;
  }

  setTab(index: number): void {
    this.selected.setValue(index);
    if (this.dbs.tabs.length > 0) {
      this.dataSource.data = this.dbs.tabs[this.selected.value].productList;
    }
  }

  addTicket() {
    this.dbs.tabCounter++;

    let newTicket: Ticket = {
      index: this.dbs.tabCounter,
      productList: [],
      total: 0
    }

    this.dbs.tabs.push(newTicket);

    setTimeout(() => {
      this.selected.setValue(this.dbs.tabs.length - 1);
    }, 500);

    this.dataSource.data = this.dbs.tabs[this.selected.value].productList;
  }

  removeTicket(index: number) {
    this.dbs.tabs.splice(index, 1);
    if (this.dbs.tabs.length > 0) {
      this.selected.setValue(this.dbs.tabs.length - 1);
    }
  }

  finishTicket(): void {
    if (this.dbs.tabs[this.selected.value].productList.length < 1) {
      return
    }

    this.dialog.open(PosFinishComponent, {
      data: {
        ticket: this.dbs.tabs[this.selected.value],
      }
    }).afterClosed()
      .pipe(
        take(1),
        tap(res => {
          if (res) {
            this.snackbar.open("Ticket finalizado exitosamente!", "Aceptar", {
              duration: 6000
            })
          }
        })
      ).subscribe()
  }

  addProduct(): void {
    // search for sku in product list
    let productResult = this.productList.filter(el => el.sku === this.search.value);

    if (productResult.length > 0) {
      this.dialog.open(PosQuantityComponent)
        .afterClosed().pipe(
          take(1),
          tap(qty => {
            if (qty) {
              this.dbs.tabs[this.selected.value].productList.unshift({ product: productResult[0], quantity: qty });

              this.dbs.tabs[this.selected.value].total = this.dbs.tabs[this.selected.value].total + (productResult[0].price * qty);

              this.dataSource.data = this.dbs.tabs[this.selected.value].productList;
              this.search.setValue('');
            }
          })
        ).subscribe()

    }
  }

  editItem(index: number): void {
    this.dialog.open(PosQuantityComponent)
      .afterClosed()
      .pipe(
        take(1),
        tap(qty => {
          if (qty) {
            this.dbs.tabs[this.selected.value].productList[index].quantity = qty;

            this.updateTicketPrice();

            this.dataSource.data = this.dbs.tabs[this.selected.value].productList;
          }
        })
      ).subscribe()
  }

  updateTicketPrice(): void {
    let total = 0;

    this.dbs.tabs[this.selected.value].productList.forEach(el => {
      total = total + (el.quantity * el.product.price);
    });

    this.dbs.tabs[this.selected.value].total = total;
  }

  checkStock(product: Product, isAdding: boolean): boolean {
    if (isAdding) {
      let actualStock
    }

    return
  }

  addQuantity(index: number): void {
    this.dbs.tabs[this.selected.value].productList[index].quantity++;
  }

  removeQuantity(index: number): void {
    this.dbs.tabs[this.selected.value].productList[index].quantity--;
  }

  removeItem(index: number): void {
    this.dbs.tabs[this.selected.value].productList.splice(index, 1);

    let total = 0;
    this.dbs.tabs[this.selected.value].productList.forEach(el => {
      total = total + (el.quantity * el.product.price);
    });

    this.dbs.tabs[this.selected.value].total = total;

    this.dataSource.data = this.dbs.tabs[this.selected.value].productList;
  }





}
