import { CreateUserComponent } from './create-user/create-user.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreatePayComponent } from './create-pay/create-pay.component';
import { MatDialog } from '@angular/material/dialog';
import { DatabaseService } from './../../core/services/database.service';
import { User } from './../../core/models/user.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { tap, filter, startWith, map } from 'rxjs/operators';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
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

  loadingAdmin = new BehaviorSubject<boolean>(true);
  loadingAdmin$ = this.loadingAdmin.asObservable();

  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['index', 'name', 'email', 'delete'];

  @ViewChild("paginatorAdmin", { static: false }) set content(paginator: MatPaginator) {
    this.dataSource.paginator = paginator;
  }

  loadingDistrict = new BehaviorSubject<boolean>(true);
  loadingDistrict$ = this.loadingDistrict.asObservable();

  dataSource3 = new MatTableDataSource();
  displayedColumns3: string[] = ['name', 'delivery', 'delete'];

  @ViewChild("paginatorDistrict", { static: false }) set content3(paginator: MatPaginator) {
    this.dataSource3.paginator = paginator;
  }

  loadingPayment = new BehaviorSubject<boolean>(true);
  loadingPayment$ = this.loadingPayment.asObservable();

  dataSourcePay = new MatTableDataSource();
  displayedPayColumns: string[] = ['name', 'account', 'icon', 'actions'];

  @ViewChild("paginatorPayment", { static: false }) set content2(paginator: MatPaginator) {
    this.dataSource3.paginator = paginator;
  }

  admins$: Observable<User[]>;
  districts$: Observable<object[]>
  payment$: Observable<object[]>

  filteredUsers$: Observable<User[]>;
  filteredUsers2$: Observable<User[]>;

  userForm = new FormControl('')

  existDistrict: Array<any> = []
  districtForm: FormGroup

  repeat$: Observable<boolean>

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
    this.admins$ = this.dbs.getConfiUsers().pipe(
      map(users => {
        return users.map((el, i) => {
          return {
            ...el,
            index: i + 1
          }
        }).sort((a, b) => a['completeName'].localeCompare(b['completeName']))
      }),
      tap(res => {
        this.dataSource.data = res
        this.loadingAdmin.next(false)
      })
    )

    //Districts
    this.districtForm = this.fb.group({
      name: ['', Validators.required],
      delivery: ['', Validators.required]
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

    this.repeat$ = combineLatest(
      this.dbs.getDistricts(),
      this.districtForm.get('name').valueChanges.pipe(
        startWith(''))
    )
      .pipe(
        map(([array, district]) => {
          if (array) {
            return district ? array.map(el => el['name'].toLowerCase()).includes(district.toLowerCase()) : false
          } else {
            return false
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


    this.filteredUsers$ = combineLatest(
      this.dbs.getConfiUsers(),
      this.userForm.valueChanges.pipe(
        filter(input => input !== null),
        startWith<any>(''),
        map(value => typeof value === 'string' ? value.toLowerCase() : value.displayName.toLowerCase()))
    ).pipe(
      map(([users, name]) => {
        let noAdmins = users.filter(el => !el['admin'])
        return name ? noAdmins.filter(option => option['completeName'].toLowerCase().includes(name)) : noAdmins;
      })
    );





  }

  showSelectedUser(staff): string | undefined {
    return staff ? staff['displayName'] : undefined;
  }

  addAdmin() {
   this.dialog.open(AddUserComponent)
  }

  deleteAdmin(user) {
    this.loadingAdmin.next(true)
    const batch = this.af.firestore.batch()
    const ref = this.af.firestore.collection(`users`).doc(user.uid);
    batch.update(ref, {
      admin: false
    })
    batch.commit().then(() => {
      this.loadingAdmin.next(false)
    })
  }


  addDistrict() {
    let district = this.districtForm.value
    this.existDistrict.push(district)
    this.loadingDistrict.next(true)
    this.updateDistrict()
    this.districtForm.setValue({
      name: '',
      delivery: null
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

  createUser(data, isedit) {
    this.dialog.open(CreateUserComponent, {
      data: {
        item: data,
        edit: isedit
      }
    })
  }

}
