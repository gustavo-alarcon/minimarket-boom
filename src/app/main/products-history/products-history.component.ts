import { switchMap, map } from 'rxjs/operators';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { Sale } from './../../core/models/sale.model';
import { DatabaseService } from 'src/app/core/services/database.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-products-history',
  templateUrl: './products-history.component.html',
  styleUrls: ['./products-history.component.scss']
})
export class ProductsHistoryComponent implements OnInit {

  dateForm: FormControl = new FormControl('')

  init$: Observable<Sale[]>

  chooseSale:Sale

  view = new BehaviorSubject<number>(1);
  view$ = this.view.asObservable();

  constructor(
    private dbs: DatabaseService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    this.init$ = this.auth.user$.pipe(
      switchMap(user=>{
        return this.dbs.getSalesUser(user.uid)
      })
    )
  }

  showList(item: Sale){
    this.chooseSale = item
    this.view.next(2)
    
  }

  back() {
    this.view.next(1)
  }

}
