import { User } from 'src/app/core/models/user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { map, startWith, filter, tap } from 'rxjs/operators';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { DatabaseService } from 'src/app/core/services/database.service';
import { Observable, combineLatest } from 'rxjs';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Product } from 'src/app/core/models/product.model';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  firstSale: boolean = false

  products$: Observable<Product[]>
  init$: Observable<User>
  categoryList$: Observable<string[]>

  name: string = ''
  maxWeight: number = 3

  searchForm: FormGroup

  defaultImage = "../../../assets/images/default-image.jpg";

  @ViewChild("movilForm", { static: false }) searchbar: ElementRef;
  @ViewChild("slogan", { static: false }) slogan: ElementRef;

  p: number = 1;
  constructor(
    public dbs: DatabaseService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    public auth: AuthService
  ) { }

  ngOnInit(): void {

    this.searchForm = this.fb.group({
      category: [''],
      name: ['']
    })

    this.categoryList$ = this.dbs.getProductsListCategoriesValueChanges()

    this.products$ = combineLatest(
      this.dbs.getProductsListValueChanges(),
      this.searchForm.get('name').valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => value.toLowerCase())
      ),
      this.searchForm.get('category').valueChanges.pipe(
        startWith<any>('Todos')
      )
    ).pipe(
      map(([products, search, category]) => {
        let publish = products.filter(el => el.published)
        if (this.dbs.order.length == 0 && localStorage.getItem('order')) {
          let number = Number(localStorage.getItem('length'))
          for (let index = 0; index < number; index++) {
            this.dbs.order[index] = {
              product: products.filter(el => el.id == localStorage.getItem('order' + index))[0],
              quantity: Number(localStorage.getItem('order' + index + 'q'))
            }

          }

          this.dbs.total = this.dbs.order.map(el => this.giveProductPrice(el)).reduce((a, b) => a + b, 0)
        }
        return publish.filter(el => search ? el.description.toLowerCase().includes(search) : true)
          .filter(el => category != 'Todos' ? el.category == category : true)
      })
    )

    this.init$ = combineLatest(
      this.dbs.getUsers(),
      this.auth.user$,
      this.dbs.getGeneralConfigDoc()
    ).pipe(
      map(([users, id, confi]) => {
        this.maxWeight = confi['maxWeight']
        if(id){
          return users.filter(el => el.uid == id.uid)[0]
        }else{
          return null
        }
      }),
      tap(res => {
        if (res) {
          if (res['salesCount']) {
            this.firstSale = false
            this.name = res.name.split(' ')[0]
            this.dbs.delivery = res.contact.district.delivery
          } else {
            this.firstSale = true
          }
        }
      })
    )

    this.dbs.total = this.dbs.order.map(el => this.giveProductPrice(el)).reduce((a, b) => a + b, 0)

  }



  getdiscount(item: Product) {
    let promo = item.price - item.promoData.promoPrice
    let discount = (promo / item.price) * 100
    return Math.round(discount)
  }

  login() {
    this.dialog.open(LoginDialogComponent)
    localStorage.setItem('order', 'true')
    localStorage.setItem('length', this.dbs.order.length.toString())
    this.dbs.order.forEach((el, i) => {
      localStorage.setItem('order' + i, el.product.id)
      localStorage.setItem('order' + i + 'q', el.quantity.toString())
    })
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

  shoppingCart() {
    this.dbs.view.next(2)

  }

  back() {
    this.dbs.view.next(1)
    this.p = 1
    this.dbs.total = this.dbs.order.map(el => this.giveProductPrice(el)).reduce((a, b) => a + b, 0)
  }

  finish() {
    this.dbs.view.next(3)
    this.p = 1
    localStorage.clear()
  }


}
