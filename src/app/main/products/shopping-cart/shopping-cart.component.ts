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

  products: {
    product: Product,
    quantity: number
  }[] = []

  constructor(
    public dbs: DatabaseService
  ) { }

  ngOnInit(): void {
  }

  roundNumber(number) {
    return Number(parseFloat(number).toFixed(1));
  }

  giveProductPrice(item) {
    if (item.product.ref) {
      if (!item.product.promo) {
        return this.roundNumber(item.quantity * item.product.refPrice)
      }
      else {
        let promRefTotalQuantity = Math.floor(item.quantity / item.product.promoData.quantity);
        let promRefTotalPrice = promRefTotalQuantity * item.product.promoData.promoPrice;
        let noPromRefTotalQuantity = item.quantity % item.product.promoData.quantity;
        let noPromRefTotalPrice = noPromRefTotalQuantity * item.product.refPrice;
        let noPromNoRefTotalPrice = noPromRefTotalPrice / item.product.price;
        return this.roundNumber(promRefTotalPrice + noPromRefTotalPrice);
      }
    }
    else {
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
  }

  delete(ind, item) {
    let index = this.products.findIndex(el => el['product']['description'] == item['product']['description'])
    this.products[index]['quantity'] = 0
    this.dbs.order.splice(ind, 1)
    this.total = 4
  }


}
