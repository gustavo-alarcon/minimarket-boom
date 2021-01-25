import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

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
  
  displayedColumns: string[] = ['item', 'cost','pay','res'];
  dataSource: Transaction[] = [
    {item: 'Billete S/. 200', cost: 4,pay:45,res:0},
    {item: 'Billete S/. 100', cost: 5,pay:45,res:0},
    {item: 'Billete S/. 50', cost: 2,pay:45,res:0},
    {item: 'Billete S/. 20', cost: 4,pay:45,res:0},
    {item:  'Billete S/.10', cost: 25,pay:45,res:0},
    {item: 'Moneda S/.5', cost: 15,pay:45,res:0},
    {item: 'Moneda S/.2', cost: 15,pay:45,res:0},
    {item: 'Otras Monedas', cost: 15,pay:45,res:0},
  ];

  
  constructor(private fb: FormBuilder,
              private dialog: MatDialog,) { }

  ngOnInit(): void {
    this.dataFormGroup = this.fb.group({
      inicialImport: ['', Validators.required],
      
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
  /** Gets the total cost of all transactions. */
  getTotalCost() {
    return this.dataSource.map(t => t.cost).reduce((acc, value) => acc + value, 0);
  }

}

export interface Transaction {
  item: string;
  cost: number;
  pay:number;
  res:number;
}
