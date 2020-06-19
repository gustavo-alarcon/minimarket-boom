import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Sale, SaleRequestedProducts } from 'src/app/core/models/sale.model';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {
  detailSubject: BehaviorSubject<Sale> = new BehaviorSubject(null)
  detail$: Observable<Sale> = this.detailSubject.asObservable();
  constructor() { }

  ngOnInit(): void {
  }

  back(){
    this.detailSubject.next(null);
  }

  givePrice(item: SaleRequestedProducts): number {
    let amount = item['quantity']
    let price = item['product']['price']
    if(item.product.promo){
      let promo = item['product']['promoData']['quantity']
      let pricePromo = item['product']['promoData']['promoPrice']
  
      if (amount >= promo) {
        let wp = amount % promo
        let op = Math.floor(amount / promo)
        return wp * price + op * pricePromo
      } else {
        return amount * price
      }
    } else {
      return amount * price
    }
  }
  giveTotalPrice(sale: Sale): number{
    return sale.requestedProducts.reduce((a,b) => a + this.givePrice(b), 0)
  }
}
