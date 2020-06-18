import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Sale } from 'src/app/core/models/sale.model';

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
}
