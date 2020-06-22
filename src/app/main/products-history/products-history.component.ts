import { switchMap, map, startWith } from 'rxjs/operators';
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

  dateForm: FormControl
  init$: Observable<Sale[]>

  chooseSale: Sale

  view = new BehaviorSubject<number>(1);
  view$ = this.view.asObservable();

  constructor(
    private dbs: DatabaseService,
    private auth: AuthService
  ) { }

  ngOnInit(): void {
    const view = this.dbs.getCurrentMonthOfViewDate();

    let beginDate = view.from;
    let endDate = new Date();
    endDate.setHours(23, 59, 59);

    this.dateForm = new FormControl({
      begin: beginDate,
      end: endDate
    })

    this.init$ = this.auth.user$.pipe(
      switchMap(user => {
        return combineLatest(
          this.dbs.getSalesUser(user.uid),
          this.dateForm.valueChanges.pipe(
            startWith<{ begin: Date, end: Date }>({ begin: beginDate, end: endDate }),
            map(({ begin, end }) => {
              begin.setHours(0, 0, 0, 0);
              end.setHours(23, 59, 59);
              return { begin, end }
            })
          )
        ).pipe(
          map(([products, date]) => {
            return products.filter(el => {
              return this.getFilterTime(el['createdAt'], date)
            })
          })
        )
      })
    )
  }

  getFilterTime(el, time) {
    let date = el.toMillis()
    let begin = time.begin.getTime()
    let end = time.end.getTime()
    return date >= begin && date <= end
  }
  showList(item: Sale) {
    this.chooseSale = item
    this.view.next(2)

  }

  back() {
    this.view.next(1)
  }

}
