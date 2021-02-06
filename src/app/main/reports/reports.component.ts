import { map, tap, startWith } from 'rxjs/operators';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Color, Label } from 'ng2-charts';

import { DatabaseService } from '../../core/services/database.service';
import { Observable, combineLatest } from 'rxjs';
import { Product } from '../../core/models/product.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ProductPerformance } from '../../core/models/productPerformance.model';

import{Chart} from 'node_modules/chart.js';


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent  {

  dateForm: FormGroup;
  
  bestSeller$: Observable<any>;
  lessSold$: Observable<any[]>;
  

  minStock$: Observable<Product[]>
  paymentType$:Observable<Product[]>;

  dataSourceProduct = new MatTableDataSource();
  displayedColumnsProduct: string[] = ['index','description','stock'];

  @ViewChild("paginatorProduct", { static: false }) set content(paginator: MatPaginator) {
    this.dataSourceProduct.paginator = paginator;
  }
  constructor( 
    public dbs: DatabaseService,
) { }

ngOnInit(): void {
  this.dbs.changeTitle('Reportes')

  const view = this.dbs.getCurrentMonthOfViewDate();

  let beginDate = view.from;
  let endDate = new Date();
  endDate.setHours(23, 59, 59);

  this.dateForm = new FormGroup({
    start: new FormControl(beginDate),
    end: new FormControl(endDate)
  });

  //show product min stock
  this.minStock$ = this.dbs.getProductListOrderByMinStock().pipe(
    tap(res => {
      let newProductMinStock:Product[]=[];

      res.map((product)=> {
        if (product.realStock <= product.alertMinimum ) {  
          newProductMinStock.push( product);
        };
      });

      newProductMinStock.sort((a,b)=>a.realStock-b.realStock)
     this.dataSourceProduct.data = newProductMinStock;
    })
  )

  //product bets seller 
  this.bestSeller$= combineLatest(         
    this.dbs.getAllProductPerformance(),
    this.dateForm.get('start').valueChanges.pipe(
      startWith(beginDate),
      map(begin => begin.setHours(0, 0, 0, 0))
    ),
    this.dateForm.get('end').valueChanges.pipe(
      startWith(endDate),
      map(end =>  end?end.setHours(23, 59, 59):null)
    )
  ).pipe(
    map(([productPerformance,startdate,enddate]) => {

      let date = {begin:startdate,end:enddate}

     let filterProductByDate =[];
     filterProductByDate =  productPerformance.filter((el) => {
      return this.getFilterTime(el.createdAt, date);
      });
      
      let groupByProduct:ProductPerformance[] = [];

      filterProductByDate.reduce((res, value)=> {
        if (!res[value.sku]) {
          res[value.sku] = { sku: value.sku,description: value.description, quantity: 0 };
          groupByProduct.push(res[value.sku])
        }
        res[value.sku].quantity += value.quantity;
        return res;
      }, {});
      
      groupByProduct.sort((a,b)=>b.quantity-a.quantity);
      
      let bestSeller = groupByProduct.slice(0,10);

      let nameProductMax=[];
      let stockProductMax=[];

      bestSeller.map((res)=>{
       nameProductMax.push(res.description);
       stockProductMax.push(res.quantity);
       
      })    
     
        new Chart(document.getElementById("bestSeller"), {
          type: 'horizontalBar',
          data: {
            labels: nameProductMax,
            datasets: [
              {
                label: "mas vendido",
                backgroundColor: ["#088A29", "#04B404","#3ADF00","#80FF00","#C8FE2E","#F4FA58", "#FACC2E","#FFBF00","#FE9A2E","#FF8000"],
                data: stockProductMax,
                fill:false      
              }
            ],
          },
          options: {
            legend: { display: false },
            title: {
              display: true,
              text: '% de ventas'
            },
            scales: {
              xAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }]
            }
          }
        })

    return bestSeller; 

    })
  )


  //product less Sold
  this.lessSold$= combineLatest(         
    this.dbs.getAllProductPerformance(),
    this.dbs.getAllProductList(),
    this.dateForm.get('start').valueChanges.pipe(
      startWith(beginDate),
      map(begin => begin.setHours(0, 0, 0, 0))
    ),
    this.dateForm.get('end').valueChanges.pipe(
      startWith(endDate),
      map(end =>  end?end.setHours(23, 59, 59):null)
    )
  ).pipe(
    map(([productPerformance,products,startdate,enddate]) => {

      let date = {begin:startdate,end:enddate}

      let filterProductByDate =[];
      filterProductByDate =  productPerformance.filter((el) => {
       return this.getFilterTime(el.createdAt, date);
       });

      let groupByProductPerformance:ProductPerformance[] = [];
      filterProductByDate.reduce((res, value)=> {
        if (!res[value.sku]) {
          res[value.sku] = { sku: value.sku,description: value.description, quantity: 0 };
          groupByProductPerformance.push(res[value.sku])
        }
        res[value.sku].quantity += value.quantity;
        return res;
      }, {});

      //comprare to ProductPerformance with products
      let productsCombine=[];

      products.forEach(products=>{
        let found = false;
        groupByProductPerformance.every(groupByProductPerformance=>{
          let exist = groupByProductPerformance.sku === products.sku;
          if(exist){
            productsCombine.push(groupByProductPerformance);
            found = exist;
          }
          return !exist
        })

        if (!found) {
          productsCombine.push({sku:products.sku,description:products.description, quantity:0})
        }
      })

     productsCombine.sort((a,b)=>b.quantity-a.quantity);
      
      let lessSold = productsCombine.slice(productsCombine.length-10,productsCombine.length);
      lessSold.sort((a,b)=>a.quantity-b.quantity);

      let nameProductMin=[];
      let stockProductMin=[];

     lessSold.map((res)=>{
      nameProductMin.push(res.description);
      stockProductMin.push(res.quantity);
       
    } )
     
        new Chart(document.getElementById("lessSold"), {
          type: 'horizontalBar',
          data: {
           labels: nameProductMin,
            datasets: [
              {
                label: "mas vendido",
                backgroundColor: ["#FF0000", "#FE2E2E","#FE642E","#FE642E","#FF8000","#FAAC58", "#F7D358","#FFBF00","#F7FE2E","#FFFF00"],
                data: stockProductMin,
                fill:false      
              }
            ],
          },
          options: {
            legend: { display: false },
            title: {
              display: true,
              text: '% de ventas'
            },
            scales: {
              xAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }]
            }
          }
        })

    return lessSold;

    })
  )

 } 

 getFilterTime(el, time) {
  let date = el.toMillis();
  let begin = time.begin;
  let end = time.end;
  return date >= begin && date <= end;
}
 

}
