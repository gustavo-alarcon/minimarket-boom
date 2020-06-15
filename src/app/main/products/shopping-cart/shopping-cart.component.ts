import { Product } from './../../../core/models/product.model';
import { DatabaseService } from './../../../core/services/database.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit {

  total: number = 0
  delivery: number = 4

  constructor(
    public dbs: DatabaseService
  ) { }

  ngOnInit(): void {
    this.total = this.dbs.order.map(el =>  this.giveProductPrice(el)).reduce((a, b) => a + b, 0)
  }

  roundNumber(number) {
    return Number(parseFloat(number).toFixed(1));
  }

  round(number) {
    return Math.floor(number)
  }

  giveProductPrice(item) {
    if (item.product.promo) {
      let promTotalQuantity = Math.floor(item.quantity / item.product.promoData.quantity);
      let promTotalPrice = promTotalQuantity * item.product.promoData.promoPrice;
      let noPromTotalQuantity = item.quantity % item.product.promoData.quantity;
      let noPromTotalPrice = noPromTotalQuantity * item.product.price;
      return this.roundNumber(promTotalPrice + noPromTotalPrice);
    }
    else {
      return this.roundNumber(item.quantity * item.product.price)
    }
  }

  delete(ind) {
    this.dbs.order.splice(ind, 1)
    this.total = this.dbs.order.map(el => this.giveProductPrice(el)).reduce((a, b) => a + b, 0)
  }


}
