import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CashBox } from '../../../core/models/cashBox.model';
import { User } from '../../../core/models/user.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { log } from 'console';

@Component({
  selector: 'app-close-cash',
  templateUrl: './close-cash.component.html',
  styleUrls: ['./close-cash.component.scss']
})
export class CloseCashComponent implements OnInit {
 
  disableSelect = new FormControl(false);

  checked: boolean = false;

  dataFormGroup: FormGroup  ;
  hidePass: boolean = true;
  
  displayedColumns: string[] = ['money','count','total'];
  dataSource: CountMoney[] = [
    {index: 1,money: 'Billete S/. 200', valor: 200,count:0,total:0},
    {index: 2,money: 'Billete S/. 100', valor:100 ,count:0,total:0},
    {index: 3,money: 'Billete S/. 50' , valor:50 ,count:0,total:0},
    {index: 4,money: 'Billete S/. 20' , valor:20,count:0,total:0},
    {index: 5,money:  'Billete S/.10' , valor:10,count:0,total:0},
    {index: 6,money: 'Moneda S/.5'    , valor: 5,count:0,total:0},
    {index: 7,money: 'Moneda S/.2'    , valor: 2,count:0,total:0},
    {index: 8,money: 'Otras Monedas'  , valor: 1,count:0,total:0},
  ];

  
  constructor(private fb: FormBuilder,
              private dialogRef: MatDialogRef<CloseCashComponent>,
              private afs: AngularFirestore,    
              private snackBar: MatSnackBar,    
              private router: Router,
              @Inject(MAT_DIALOG_DATA) public data: { user: User}
              ) { }

  ngOnInit(): void {
    this.dataFormGroup = this.fb.group({
      closureBalance: ['', Validators.required],
      pass: ['', Validators.required],
      
    })
  }

  changeValue(value) {
    this.checked = !value;
  }
  
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();
    //this.dataSource.res = filterValue;
  }
  
  closeCash(){
    console.log('close Data : ' , this.data.user)
    console.log(this.dataFormGroup.invalid)

    //if (this.dataFormGroup.invalid) {
        
      console.log('this.dataFormGroup.invalid')
       let closureBalance = this.dataFormGroup.value['closureBalance'];
       let password = this.dataFormGroup.value['pass'];
       let passwordCurrentUser=this.data.user.currentCash.password;

       if (password == passwordCurrentUser) {
        
        console.log('close cash box')
         
        this.updateUserCashBox();
        this.updateOpening();
        this.updateUser();
        this.snackBar.open("la caja se cerró correcta", "Cerrar");
        this.router.navigateByUrl('main');
        this.dialogRef.close();
       }
       else{
        this.snackBar.open("la Contraseña es incorrecta", "Cerrar");

       }
      
   // }
  }
  updateUser(){
    
      const batch = this.afs.firestore.batch()
      const userRef = this.afs.firestore.collection(`/users`).doc(this.data.user.uid);

      const updateUser = {
        currentCash: null
      }

      batch.update(userRef, updateUser)

      batch.commit()
      .then(() => {
       
      })
      .catch(err => {
        
    })
  }
  updateUserCashBox(){
    
    const batch = this.afs.firestore.batch()
    const cashBoxRef = this.afs.firestore.collection(`/db/minimarketBoom/cashBox`).doc(this.data.user.currentCash.uid);
    
    const cashData = {
      open: false,
      currentOwner: null,
      lastClosure: Date.now(),
      currentOpening: null,
    }

    batch.update(cashBoxRef, cashData)

    batch.commit()
    .then(() => {
          
    })
    .catch(err => {

    })
  }

  updateOpening(){
    
    const batch = this.afs.firestore.batch()  
    const openingRef = this.afs.firestore.collection(`/db/minimarketBoom/cashBox/${this.data.user.currentCash.uid}/openings`).doc(this.data.user.currentCash.currentOpening);   
    
    const openingData = {
      closedBy: this.data.user.displayName,
      closedByUid: this.data.user.uid,
      closureDate: Date.now(),
      closureBalance: this.dataFormGroup.value['closureBalance'],      
      detailMoneyDistribution:this.dataSource,
     /*  
      totalImport: this.data.totalImport,
      totalTickets: this.data.totalTickets,
      totalDepartures: this.data.totalDepartures,
      totalTicketsByPaymentType: this.data.totalTicketsByPaymentType,
      totalDeparturesByPaymentType: this.data.totalDeparturesByPaymentType 
      */
    }

      batch.update(openingRef, openingData)

      batch.commit().then(() => {
       
      }) 
      .catch(err => {
       
      }) 
  }

  changeInput(input ,data:CountMoney){

    let inputValue= input.target.value;
    let closureBalance = this.dataFormGroup.value['closureBalance'];

    console.log('Monto Total : ', this.getTotalMoney())
    console.log('closureBalance : ', closureBalance)

    if (inputValue>=0 && this.getTotalMoney()<= closureBalance) {
      let index = data.index;
      let valor:number= data.valor;
      let newCount:number = inputValue;
  
      let newTotal = valor * newCount;  
  
      for (let i = 0; i < this.dataSource.length; i++) {      
  
        if (this.dataSource[i].index == index) {
  
        const element = this.dataSource[i];
        console.log(element);
  
        this.dataSource[i].count = inputValue;
        this.dataSource[i].total = newTotal;
        }
        
      }     
    } else{

      this.snackBar.open("no puedes ingresar numeros negativos", "Cerrar");

    }
   
   }

   getTotalMoney() {
      return this.dataSource.map(t => t.total).reduce((acc, value) => acc + value, 0);
   }

}

export interface CountMoney {
  index:number;
  money: string;
  valor: number;
  count:number;
  total:number;
}
