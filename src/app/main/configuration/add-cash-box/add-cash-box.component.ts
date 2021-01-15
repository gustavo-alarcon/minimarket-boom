import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { DatabaseService } from '../../../core/services/database.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, take, startWith, debounceTime } from 'rxjs/operators';
import { CashBox } from '../../../core/models/cashBox.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-add-cash-box',
  templateUrl: './add-cash-box.component.html',
  styleUrls: ['./add-cash-box.component.scss']
})
export class AddCashBoxComponent implements OnInit {

  loading = new BehaviorSubject<boolean>(false)
  loading$ = this.loading.asObservable()
 
  cashBoxForm: FormGroup

  users$: Observable<string[]>;

  
  hidePass: boolean = true;
  constructor(
    private auth: AuthService,
    private dialogRef: MatDialogRef<AddCashBoxComponent>,
    private fb: FormBuilder,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    private afs: AngularFirestore,    
    @Inject(MAT_DIALOG_DATA) public data: { item: CashBox, edit: boolean }
    ) { 


  }

  ngOnInit(): void {

    if (this.data.edit) {
      this.cashBoxForm = this.fb.group({
        caja: [this.data.item.cashier, [Validators.required], [this.cashierRepeatedValidator()]],
        user: [this.data.item.user, Validators.required],
        pass: [this.data.item.password, Validators.required],

      })

      //this.cashBoxForm.get('').disable()
    } else {
      this.cashBoxForm = this.fb.group({
        caja: [null, [Validators.required], [this.cashierRepeatedValidator()]],
        user: [null, Validators.required],
        pass: [null, [Validators.required, Validators.minLength(6)]],
      })
    }


    this.users$ = combineLatest(
      this.cashBoxForm.get('user').valueChanges.pipe(
        startWith(''),
        map(name=>name? name:'')
        ),
        this.dbs.getUsersValueChanges()
   ).pipe(map(([formValue,users])=>{
     console.log('formValue : ',formValue)
     console.log('users : ',users)
     let filter = users.filter(el => formValue ? el.name.toLowerCase().includes(formValue.toLowerCase()):'');
     return filter;
   }))
  }

  get caja() {
    return this.cashBoxForm.get('caja');
  }

  save(){
    this.cashBoxForm.markAsPending();
    this.cashBoxForm.disable()
    this.loading.next(true)

    if (this.data.edit) {
      this.edit()
    } else {
      this.create()
    }

  }
  create(): void {

    this.auth.user$.pipe(take(1)).subscribe(user => {

      const batch = this.afs.firestore.batch()
      const cashBoxRef = this.afs.firestore.collection(`/db/minimarketBoom/cashBox`).doc();

      let newCashBox = {
        uid: cashBoxRef.id,
        cashier: this.cashBoxForm.get('caja').value,
        user: this.cashBoxForm.get('user').value,
        password: this.cashBoxForm.get('pass').value,
        createdBy: user,
        state:'Cerrado',
        createdAt: new Date(),
      }      

        batch.set(cashBoxRef, newCashBox)

        batch.commit().then(() => {
          this.loading.next(false)
          this.dialogRef.close();
          this.snackBar.open('El nuevo caja fue creado satisfactoriamente', 'Cerrar', { duration: 5000 });
        }) 
        .catch(err => {
          console.log(err);
          this.snackBar.open("Ups! parece que hubo un error ...", "Cerrar");
        })

    })  
         

  }
  edit(){

    this.auth.user$.pipe(take(1)).subscribe(user => {

    const batch = this.afs.firestore.batch()
    const cashBoxRef = this.afs.firestore.collection(`/db/minimarketBoom/cashBox`).doc(this.data.item.uid);

    let updateCashBox = {
      uid: cashBoxRef.id,
      cashier: this.cashBoxForm.get('caja').value,
      user: this.cashBoxForm.get('user').value,
      password: this.cashBoxForm.get('pass').value,
      createdBy: user,
      state:'Cerrado',
      createdAt: new Date(),
    } 

    batch.update(cashBoxRef, updateCashBox)

    batch.commit()
      .then(() => {
        this.loading.next(false)
        this.dialogRef.close();
        this.snackBar.open("Caja fue editado!", "Cerrar");
      })
      .catch(err => {
        console.log(err);
        this.snackBar.open("Ups! parece que hubo un error ...", "Cerrar");
      })

    })  

  }

  cashierRepeatedValidator() {
    return (control: AbstractControl) => {
      const value = control.value.toLowerCase();
      return this.dbs.getcashBoxStatic().pipe(
        debounceTime(500),
        map(res => {

          return res.find(el => el.cashier.toLowerCase() == value) ? { emailRepeatedValidator: true } : null
        }),
        take(1)
      )
    }
  }
}
