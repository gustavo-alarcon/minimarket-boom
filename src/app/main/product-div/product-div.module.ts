import { ProductDivComponent } from './product-div.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [
    ProductDivComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    LazyLoadImageModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule
  ],
  exports:[
    ProductDivComponent
  ]
})
export class ProductDivModule { }
