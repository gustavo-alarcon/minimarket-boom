import { BehaviorSubject, Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  view: BehaviorSubject<number> = new BehaviorSubject(1)
  view$: Observable<number> = this.view.asObservable();

  constructor() { }

  ngOnInit(): void {
  }

  shoppingCart(){
    this.view.next(2)
  }

  back(){
    this.view.next(1)
  }

  finish(){
    this.view.next(3)
  }

}
