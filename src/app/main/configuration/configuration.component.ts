import { CreateUserComponent } from './create-user/create-user.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreatePayComponent } from './create-pay/create-pay.component';
import { MatDialog } from '@angular/material/dialog';
import { DatabaseService } from './../../core/services/database.service';
import { User } from './../../core/models/user.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl } from '@angular/forms';
import { tap, filter, startWith, map } from 'rxjs/operators';
import { Observable, combineLatest, BehaviorSubject, of } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AddUserComponent } from './add-user/add-user.component';

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


  p1: number = 1;
  p2: number = 1;
  p3: number = 1;

  constructor(
    private fb: FormBuilder,
    private af: AngularFirestore,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {

    //Admins
    this.searchForm = this.fb.group({
      name: null,
      permits: null
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
      admin: false,
      role: null
    })
    batch.commit().then(() => {
      this.loadingAdmin.next(false)
    })
  }

  repeatedValidator() {
    return (control: AbstractControl) => {
      const value = control.value.toLowerCase();
      return of(this.existDistrict).pipe(
        map(res => {
          return res.findIndex(el => el['name'].toLowerCase() == value) >= 0 ? { repeatedValidator: true } : null
        }))
    }
  }

  //Districts
  addDistrict() {
    let district = this.districtForm.value
    this.existDistrict.push(district)
    this.loadingDistrict.next(true)
    this.updateDistrict()

    this.districtForm = this.fb.group({
      name: ['', Validators.required],
      delivery: ['', Validators.required]
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
    const batch = this.af.firestore.batch()
    const ref = this.af.firestore.collection(`/db/distoProductos/config`).doc('generalConfig')
    batch.update(ref, {
      districts: this.existDistrict
    })
    batch.commit().then(() => {
      this.loadingDistrict.next(false)

    })
  }

  //Weight

  saveWeight() {
    this.loadingWeight.next(true)
    const batch = this.af.firestore.batch()
    const ref = this.af.firestore.collection(`/db/distoProductos/config`).doc('generalConfig')
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
    const payRef = this.af.firestore.collection(`/db/distoProductos/config/`).doc('generalConfig');
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
  }



}
