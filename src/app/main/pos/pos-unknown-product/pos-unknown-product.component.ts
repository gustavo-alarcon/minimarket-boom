import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { ProductCreateEditComponent } from '../../products-list/product-create-edit/product-create-edit.component';

@Component({
  selector: 'app-pos-unknown-product',
  templateUrl: './pos-unknown-product.component.html',
  styleUrls: ['./pos-unknown-product.component.scss']
})
export class PosUnknownProductComponent implements OnInit {

  price = new FormControl(null, Validators.required);
  quantity = new FormControl(null, Validators.required);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { sku: string },
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<PosUnknownProductComponent>
  ) { }

  ngOnInit(): void {
  }

  create(): void {
    this.dialog.open(ProductCreateEditComponent, {
      data: {
        data: null,
        edit: false
      }
    }).afterClosed()
      .pipe(take(1))
      .subscribe(res => {
        if (res) {
          this.dialogRef.close({
            product: true,
            price: null,
            quantity: null
          })
        }
      })
  }

  save(): void {
    this.dialogRef.close({
      product: false,
      price: this.price.value,
      quantity: this.quantity.value
    })
  }

}
