import { CreateCategoryComponent } from './create-category/create-category.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreatePayComponent } from './create-pay/create-pay.component';
import { MatDialog } from '@angular/material/dialog';
import { DatabaseService } from './../../core/services/database.service';
import { User } from './../../core/models/user.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { tap, filter, startWith, map, takeLast } from 'rxjs/operators';
import { Observable, combineLatest, BehaviorSubject, of } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AddUserComponent } from './add-user/add-user.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AddCashBoxComponent } from './add-cash-box/add-cash-box.component';
import { CashBox } from '../../core/models/cashBox.model';
import { DeleteCashBoxComponent } from './delete-cash-box/delete-cash-box.component';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {

  /*Admins*/
  admins$: Observable<User[]>;

  loadingAdmin = new BehaviorSubject<boolean>(true);
  loadingAdmin$ = this.loadingAdmin.asObservable();

  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['index', 'name', 'email', 'role', 'delete'];

  @ViewChild("paginatorAdmin", { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  permits: Array<string> = ['Administrador', 'Vendedora', 'Logística', 'Contabilidad', 'Todos']
  searchForm: FormGroup

  /*Districts*/
  districts$: Observable<object[]>
  repeat$: Observable<boolean>

  loadingDistrict = new BehaviorSubject<boolean>(true);
  loadingDistrict$ = this.loadingDistrict.asObservable();

  dataSource3 = new MatTableDataSource();
  displayedColumns3: string[] = ['name', 'delivery', 'delete'];

  @ViewChild("paginatorDistrict", { static: false }) set content3(paginator: MatPaginator) {
    this.dataSource3.paginator = paginator;
  }

  existDistrict: Array<any> = []
  districtForm: FormGroup


  /*Weight*/
  weightForm = new FormControl([null, Validators.required])
  weight$: Observable<number>

  loadingWeight = new BehaviorSubject<boolean>(true);
  loadingWeight$ = this.loadingWeight.asObservable();

  /*Payments*/
  payment$: Observable<object[]>

  loadingPayment = new BehaviorSubject<boolean>(true);
  loadingPayment$ = this.loadingPayment.asObservable();

  dataSourcePay = new MatTableDataSource();
  displayedPayColumns: string[] = ['name', 'account', 'icon', 'actions'];

  @ViewChild("paginatorPayment", { static: false }) set content2(paginator: MatPaginator) {
    this.dataSourcePay.paginator = paginator;
  }

  /*Categories*/
  categories$: Observable<object[]>
  // categories: Array<any>

  loadingCategories = new BehaviorSubject<boolean>(true);
  loadingCategories$ = this.loadingCategories.asObservable();

  indCategory: number = 1
  defaultImage = "../../../assets/images/boom-logo-horizontal.jpg";


  p1: number = 1;
  p2: number = 1;
  p3: number = 1;

  openingFormGroup: FormGroup;
  opening$: Observable<{ opening: string, closing: string }[]>

  loadingOpening = new BehaviorSubject<boolean>(true);
  loadingOpening$ = this.loadingOpening.asObservable();

  days: Array<string> = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ]
  
   /*CashBox*/
   cashBox$: Observable<CashBox[]>;

   loadingCashBox = new BehaviorSubject<boolean>(true);
   loadingCashBox$ = this.loadingCashBox.asObservable();
 
   dataSourceCashBox = new MatTableDataSource();
   displayedColumnsCashBox: string[] = ['index', 'state', 'caja', 'user', 'password','lastOpening','lastClosing','actions'];
 
   @ViewChild("paginatorCashBox", { static: false }) set content4(paginator: MatPaginator) {
     this.dataSourceCashBox.paginator = paginator;
   }

   searchBoxForm: FormGroup;
   counterBox:number=0;

   /*Ingresos*/
   income$: Observable<object[]>
  repeats$: Observable<boolean>

  loadingIncome = new BehaviorSubject<boolean>(true);
  loadingIncome$ = this.loadingIncome.asObservable();

  dataSourceIncome = new MatTableDataSource();
  displayedColumnsIncome: string[] = ['income', 'actions'];

  @ViewChild("paginatorIcome", { static: false }) set content5(paginator: MatPaginator) {
    this.dataSourceIncome.paginator = paginator;
  }

  existIncome: Array<any> = []
  incomeForm: FormGroup


  /*Egresos*/
  expenses$: Observable<object[]>
  repeatss$: Observable<boolean>

  loadingExpenses = new BehaviorSubject<boolean>(true);
  loadingExpenses$ = this.loadingExpenses.asObservable();

  dataSourceExpenses = new MatTableDataSource();
  displayedColumnsExpenses: string[] = ['expenses', 'actions'];

  @ViewChild("paginatorExpenses", { static: false }) set content6(paginator: MatPaginator) {
    this.dataSourceExpenses.paginator = paginator;
  }

  existExpenses: Array<any> = []
  expensesForm: FormGroup


  constructor(
    private fb: FormBuilder,
    private af: AngularFirestore,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.dbs.changeTitle('Configuración');

    //Admins
    this.searchForm = this.fb.group({
      name: null,
      permits: null
    })

    //CashBox
    this.searchBoxForm = this.fb.group({
      box: null,
    })

    this.openingFormGroup = this.fb.group({
      monday_opening: ['00:00', Validators.required],
      monday_closing: ['00:00', Validators.required],
      tuesday_opening: ['00:00', Validators.required],
      tuesday_closing: ['00:00', Validators.required],
      wednesday_opening: ['00:00', Validators.required],
      wednesday_closing: ['00:00', Validators.required],
      thursday_opening: ['00:00', Validators.required],
      thursday_closing: ['00:00', Validators.required],
      friday_opening: ['00:00', Validators.required],
      friday_closing: ['00:00', Validators.required],
      saturday_opening: ['00:00', Validators.required],
      saturday_closing: ['00:00', Validators.required],
      sunday_opening: ['00:00', Validators.required],
      sunday_closing: ['00:00', Validators.required]
    })

    this.admins$ = combineLatest(
      this.dbs.getConfiUsers(),
      this.searchForm.get('name').valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.email.toLowerCase())),
      this.searchForm.get('permits').valueChanges.pipe(
        startWith<any>('Todos'))
    ).pipe(
      map(([users, name, role]) => {
        return users.sort((a, b) => a['completeName'].localeCompare(b['completeName']))
          .filter(el => name ? el.completeName.toLowerCase().includes(name) : true)
          .filter(el => role != 'Todos' ? el.role == role : true)
          .map((el, i) => {
            return {
              ...el,
              index: i + 1
            }
          })
      }),
      tap(res => {
        this.dataSource.data = res
        this.loadingAdmin.next(false)
      })
    )



    //Districts
    this.districtForm = this.fb.group({
      name: ['', [Validators.required], [this.repeatedValidator()]],
      delivery: ['', [Validators.required]]
    })

    this.districts$ = this.dbs.getDistricts().pipe(
      tap(res => {
        if (res) {
          this.dataSource3.data = res
          this.existDistrict = res
          this.loadingDistrict.next(false)
        }
      })
    )


    //Payments
    this.payment$ = this.dbs.getPayments().pipe(
      tap(res => {
        if (res) {
          this.dataSourcePay.data = res
          this.loadingPayment.next(false)
        }

      })
    )


    //Weight
    this.weight$ = this.dbs.getGeneralConfigDoc().pipe(
      map(el => el['maxWeight']),
      tap(res => {
        this.weightForm.setValue(res)
        this.loadingWeight.next(false)
      })
    )

    //Categories
    this.categories$ = this.dbs.getGeneralConfigDoc().pipe(
      map(el => el['categories']),
      tap(res => {
        if (res) {
          // this.categories = res
          this.indCategory = res.length + 1
        }
        this.loadingCategories.next(false)
      })
    )

    this.opening$ = this.dbs.getGeneralConfigDoc().pipe(
      map(el => el['opening']),
      tap(res => {
        res.forEach((element, index) => {
          this.openingFormGroup.get(`${this.days[index]}_opening`).setValue(element['opening']);
          this.openingFormGroup.get(`${this.days[index]}_closing`).setValue(element['closing']);
        });
        this.loadingOpening.next(false)
      })
    )

    //CashBox

    this.cashBox$ = combineLatest(
      this.dbs.getAllCashBox(),
      this.searchBoxForm.get('box').valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.cashier.toLowerCase())),
     
    ).pipe(
      map(([cashBox, name, ]) => {
        return cashBox.sort((a, b) => a['cashier'].localeCompare(b['cashier']))
          .filter(el => name ? el.cashier.toLowerCase().includes(name) : true)
          .map((el, i) => {
            return {
              ...el,
              index: i + 1
            }
          })
      }),
      tap(res => {
        this.dataSourceCashBox.data = res
          this.loadingCashBox.next(false)
          this.counterBox = res.length;
      })
    )

    // Ingresos
    this.incomeForm = this.fb.group({
      income: ['', [Validators.required], [this.repeatedValidatorIncome()]],
    })

    this.income$ = this.dbs.getIncomes().pipe(
      tap(res => {
        if (res) {
          this.dataSourceIncome.data = res
          this.existIncome = res
          this.loadingIncome.next(false)
        }
      })
    )
    
    // Egresos
    this.expensesForm = this.fb.group({
      expenses: ['', [Validators.required], [this.repeatedValidatorExpenses()]],
    })

    this.expenses$ = this.dbs.getExpenses().pipe(
      tap(res => {
        if (res) {
          this.dataSourceExpenses.data = res
          this.existExpenses = res
          this.loadingExpenses.next(false)
        }
      })
    )
  }


  //Admins
  addAdmin() {
    this.dialog.open(AddUserComponent)
  }

  createUser(data, isedit) {
    this.dialog.open(CreateUserComponent, {
      data: {
        item: data,
        edit: isedit
      }
    })
  }

  deleteAdmin(user) {
    this.loadingAdmin.next(true)
    const batch = this.af.firestore.batch()
    const ref = this.af.firestore.collection(`users`).doc(user.uid);
    batch.update(ref, {
      seller: false,
      logistic: false,
      accountant: false,
      admin: false,
      role: null
    })
    batch.commit().then(() => {
      this.loadingAdmin.next(false)
    })
  }


  //Districts

  repeatedValidator() {
    return (control: AbstractControl) => {
      const value = control.value.toLowerCase();
      return of(this.existDistrict).pipe(
        map(res => {
          return res.findIndex(el => el['name'].toLowerCase() == value) >= 0 ? { repeatedValidator: true } : null
        }))
    }
  }

  addDistrict() {
    let district = this.districtForm.value
    let min = [district]
    let before = [...this.existDistrict]
    this.existDistrict = min.concat(before)
    this.loadingDistrict.next(true)
    this.updateDistrict()

    this.districtForm = this.fb.group({
      name: ['', [Validators.required], [this.repeatedValidator()]],
      delivery: ['', [Validators.required]]
    })

  }

  deleteDistrict(district) {
    let index = this.existDistrict.findIndex(el => el['name'] == district['name'])
    this.existDistrict.splice(index, 1)
    this.loadingDistrict.next(true)
    this.updateDistrict()
  }

  editDistrict(district) {
    this.districtForm.setValue(district)
    this.deleteDistrict(district)
  }


  updateDistrict() {
    this.districtForm.disable()
    const batch = this.af.firestore.batch()
    const ref = this.af.firestore.collection(`/db/minimarketBoom/config`).doc('generalConfig')
    batch.update(ref, {
      districts: this.existDistrict
    })
    batch.commit().then(() => {
      this.loadingDistrict.next(false)
      this.districtForm.enable()
    })
  }

  //Weight

  saveWeight() {
    this.loadingWeight.next(true)
    const batch = this.af.firestore.batch()
    const ref = this.af.firestore.collection(`/db/minimarketBoom/config`).doc('generalConfig')
    batch.update(ref, {
      maxWeight: this.weightForm.value
    })
    batch.commit().then(() => {
      this.loadingWeight.next(false)

    })
  }

  //Payments
  createPay(data, isedit) {
    this.dialog.open(CreatePayComponent, {
      data: {
        item: data,
        edit: isedit
      }
    })
  }

  deletePay(data) {
    this.loadingPayment.next(true)
    const payRef = this.af.firestore.collection(`/db/minimarketBoom/config/`).doc('generalConfig');
    this.dbs.deletePhotoProduct(data.photoPath).pipe(takeLast(1)).subscribe(() => {
      return this.af.firestore.runTransaction((transaction) => {
        return transaction.get(payRef).then((doc) => {
          if (!doc.exists) {
            transaction.set(payRef, { payments: [] });
          }

          const payments = doc.data().payments ? doc.data().payments : [];

          let ind = payments.findIndex(el => el.name == data.name)
          payments.splice(ind, 1)
          transaction.update(payRef, { payments: payments });

        });

      }).then(() => {
        this.loadingPayment.next(false)
        this.snackBar.open("Elemento eliminado", "Cerrar", {
          duration: 4000
        })
      }).catch(function (error) {
        console.log("Transaction failed: ", error);
      });
    })

  }

  //Categories

  createCategory(data, isedit) {
    this.dialog.open(CreateCategoryComponent, {
      data: {
        item: data,
        edit: isedit,
        index: this.indCategory
      }
    })
  }

  deleteCategory(data) {
    this.loadingCategories.next(true)
    const categoryRef = this.af.firestore.collection(`/db/minimarketBoom/config/`).doc('generalConfig');

    this.dbs.deletePhotoProduct(data.photoPath).pipe(takeLast(1)).subscribe(() => {
      return this.af.firestore.runTransaction((transaction) => {
        return transaction.get(categoryRef).then((doc) => {
          if (!doc.exists) {
            transaction.set(categoryRef, { categories: [] });
          }

          const list = doc.data().categories ? doc.data().categories : [];

          let ind = list.findIndex(el => el.name == data.name)
          list.splice(ind, 1)
          transaction.update(categoryRef, { categories: list });

        });

      }).then(() => {
        this.loadingCategories.next(false)
        this.snackBar.open("Elemento eliminado", "Cerrar", {
          duration: 4000
        })
      }).catch(function (error) {
        console.log("Transaction failed: ", error);
      });
    })

  }

  drop(array, event: CdkDragDrop<string[]>) {
    moveItemInArray(array, event.previousIndex, event.currentIndex);
  }

  savePosition(array) {

    let newArray = array.map((el, i) => {
      el['index'] = i + 1
      return el
    })

    let batch = this.af.firestore.batch();
    this.loadingCategories.next(true)
    const ref = this.af.firestore.collection(`/db/minimarketBoom/config/`).doc('generalConfig');
    batch.update(ref, {
      categories: newArray
    })

    batch.commit().then(() => {
      this.snackBar.open("Cambios Guardados", "Cerrar", {
        duration: 6000
      })
      this.loadingCategories.next(false)
      console.log('done');

    })
  }

  saveOpening(): void {

    let openingArray =
      [
        {
          opening: this.openingFormGroup.value['monday_opening'],
          closing: this.openingFormGroup.value['monday_closing']
        },
        {
          opening: this.openingFormGroup.value['tuesday_opening'],
          closing: this.openingFormGroup.value['tuesday_closing']
        },
        {
          opening: this.openingFormGroup.value['wednesday_opening'],
          closing: this.openingFormGroup.value['wednesday_closing']
        },
        {
          opening: this.openingFormGroup.value['thursday_opening'],
          closing: this.openingFormGroup.value['thursday_closing']
        },
        {
          opening: this.openingFormGroup.value['friday_opening'],
          closing: this.openingFormGroup.value['friday_closing']
        },
        {
          opening: this.openingFormGroup.value['saturday_opening'],
          closing: this.openingFormGroup.value['saturday_closing']
        },
        {
          opening: this.openingFormGroup.value['sunday_opening'],
          closing: this.openingFormGroup.value['sunday_closing']
        }
      ];
    let batch = this.af.firestore.batch();

    this.loadingOpening.next(true);
    const ref = this.af.firestore.collection(`/db/minimarketBoom/config/`).doc('generalConfig');

    batch.update(ref, {
      opening: openingArray
    })

    batch.commit().then(() => {
      this.snackBar.open("Cambios Guardados", "Cerrar", {
        duration: 6000
      })
      this.loadingCategories.next(false);
      // console.log('done');
    })

  }

  // CashBox
  createCashBox(data, isedit) {
    this.dialog.open(AddCashBoxComponent, {
      data: {
        item: data,
        edit: isedit
      }
    })
  }

  editCashBox(data,isedit){
    this.dialog.open(AddCashBoxComponent, {
      data: {
        item: data,
        edit: isedit
      }
    })
  }

  deleteCashBox(data){
     
    this.dialog.open(DeleteCashBoxComponent, {
      data: {
        item: data,
      }
    })
  }
 
  // Incomes

  repeatedValidatorIncome() {
    return (control: AbstractControl) => {
      const value = control.value.toLowerCase();
      return of(this.existIncome).pipe(
        map(res => {
          return res.findIndex(el => el['income'].toLowerCase() == value) >= 0 ? { repeatedValidatorIncome: true } : null
        }))
    }
  }

  addIncomes() {
    let income = this.incomeForm.value
    let min = [income]
    let before = [...this.existIncome]
    this.existIncome = min.concat(before)
    this.loadingIncome.next(true)
    this.updateIncomes()

    this.incomeForm = this.fb.group({
      income: ['', [Validators.required],  [this.repeatedValidatorIncome()] ],
    })
  }

  updateIncomes() {
    this.incomeForm.disable()
    const batch = this.af.firestore.batch()
    const ref = this.af.firestore.collection(`/db/minimarketBoom/config`).doc('generalConfig')
    batch.update(ref, {
      incomes: this.existIncome
    })
    batch.commit().then(() => {
      this.loadingIncome.next(false)
      this.incomeForm.enable()
    })
  }

  deleteIncome(income) {
    let index = this.existIncome.findIndex(el => el['name'] == income['name'])
    this.existIncome.splice(index, 1)
    this.loadingIncome.next(true)
    this.updateIncomes()
  }

  editIncome(inome) {
    this.incomeForm.setValue(inome)
    this.deleteIncome(inome)
  }

    // Expenses
    repeatedValidatorExpenses() {
      return (control: AbstractControl) => {
        const value = control.value.toLowerCase();
        return of(this.existExpenses).pipe(
          map(res => {
            return res.findIndex(el => el['expenses'].toLowerCase() == value) >= 0 ? { repeatedValidatorExpenses: true } : null
          }))
      }
    }

    addExpenses() {
      let expense = this.expensesForm.value
      let min = [expense]
      let before = [...this.existExpenses]
      this.existExpenses = min.concat(before)
      this.loadingExpenses.next(true)
      this.updateExpenses()
  
      this.expensesForm = this.fb.group({
        expenses: ['', [Validators.required], [this.repeatedValidatorExpenses()]],
      })
    }
  
    updateExpenses() {
      this.expensesForm.disable()
      const batch = this.af.firestore.batch()
      const ref = this.af.firestore.collection(`/db/minimarketBoom/config`).doc('generalConfig')
      batch.update(ref, {
        expenses: this.existExpenses
      })
      batch.commit().then(() => {
        this.loadingExpenses.next(false)
        this.expensesForm.enable()
      })
    }
  
    deleteExpenses(expense) {
      let index = this.existExpenses.findIndex(el => el['name'] == expense['name'])
      this.existExpenses.splice(index, 1)
      this.loadingExpenses.next(true)
      this.updateExpenses()
    }
  
    editExpenses(expense) {
      this.expensesForm.setValue(expense)
      this.deleteExpenses(expense)
    }
}
