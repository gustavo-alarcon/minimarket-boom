import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatabaseService } from 'src/app/core/services/database.service';
import { Product } from 'src/app/core/models/product.model';
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';

@Component({
  selector: 'app-product-div',
  templateUrl: './product-div.component.html',
  styleUrls: ['./product-div.component.scss']
})
export class ProductDivComponent implements OnInit {

  @Input() product: Product
  @Input() maxWeight: number
  @Input() buttonAdd: boolean = false
  defaultImage = "../../../assets/images/Disto_Logo1.png";

  constructor(
    public dbs: DatabaseService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }

  add(item) {
    let index = this.dbs.order.findIndex(el => el['product']['id'] == item['id'])

    if (index == -1) {
      let newproduct = {
        product: item,
        quantity: 1
      }
      this.dbs.order.push(newproduct)
    } else {
      this.dbs.order[index]['quantity']++
    }

    this.dbs.total = this.dbs.order.map(el => this.giveProductPrice(el)).reduce((a, b) => a + b, 0)

    let stop = this.maxWeight
    let quantity = this.dbs.order.map(el => el.quantity * el.product.unit.weight).reduce((a, b) => a + b, 0)

    if (quantity >= stop) {
      this.snackBar.open('Ha llegado al límite máximo de peso por pedido', 'Cerrar', {
        duration: 3000
      })
    }
  }

  stopBuy(item: Product) {
    let prod = item.unit.weight
    let stop = this.maxWeight
    let quantity = this.dbs.order.map(el => el.quantity * el.product.unit.weight).reduce((a, b) => a + b, 0)

    return stop - quantity >= prod
  }

  giveProductPrice(item) {
    if (item.product.promo) {
      let promTotalQuantity = Math.floor(item.quantity / item.product.promoData.quantity);
      let promTotalPrice = promTotalQuantity * item.product.promoData.promoPrice;
      let noPromTotalQuantity = item.quantity % item.product.promoData.quantity;
      let noPromTotalPrice = noPromTotalQuantity * item.product.price;
      return Number((promTotalPrice + noPromTotalPrice).toFixed(1));
    }
    else {
      return Number((item.quantity * item.product.price).toFixed(1));
    }
  }

  getdiscount(item: Product) {
    let promo = item.price - item.promoData.promoPrice
    let discount = (promo / item.price) * 100
    return Math.round(discount)
  }

  navigate(name) {
    this.router.navigate(['/main/products/recetas',name]);
  }

}
