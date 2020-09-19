import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-pos-quantity',
  templateUrl: './pos-quantity.component.html',
  styleUrls: ['./pos-quantity.component.scss']
})
export class PosQuantityComponent implements OnInit {

  quantityFormControl = new FormControl(null, Validators.required);

  constructor(
    private dialogRef: MatDialogRef<PosQuantityComponent>,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }

  save(): void {
    if (this.quantityFormControl.valid) {
      this.dialogRef.close(parseFloat(this.quantityFormControl.value));
    } else {
      this.snackbar.open("Asigne una cantidad", "Aceptar", {
        duration: 3000
      });
    }
    

    
  }

  close(): void {
    this.dialogRef.close();
  }

}
