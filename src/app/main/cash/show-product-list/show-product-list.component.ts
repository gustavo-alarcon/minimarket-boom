import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-show-product-list',
  templateUrl: './show-product-list.component.html',
  styleUrls: ['./show-product-list.component.scss']
})
export class ShowProductListComponent implements OnInit {

  displayedColumns: string[] = ['product', 'price', 'quantity', 'total'];
  dataSource = new MatTableDataSource<{ product: Product }>();

  constructor(
             @Inject(MAT_DIALOG_DATA) public data:{product}
              ) { }

  ngOnInit(): void {

    this.dataSource.data = this.data.product.ticket.productList;
  }

}
