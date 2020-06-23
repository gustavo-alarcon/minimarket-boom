import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { Sale, saleStatusOptions, SaleRequestedProducts } from 'src/app/core/models/sale.model';
import { shareReplay, startWith, switchMap, map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { DatabaseService } from 'src/app/core/services/database.service';
import { MatDialog } from '@angular/material/dialog';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-sales-master',
  templateUrl: './sales-master.component.html',
  styleUrls: ['./sales-master.component.scss']
})
export class SalesMasterComponent implements OnInit {
  @Input() detailSubject: BehaviorSubject<Sale>
  @Input() totalPriceSubject: BehaviorSubject<number>;

  defaultImage = '../../../../assets/images/no-image.png'

  p: number = 1;

  saleStateSubject: BehaviorSubject<string> = new BehaviorSubject('Total');
  saleState$: Observable<string> = this.saleStateSubject.asObservable().pipe(shareReplay(1));
  salesFiltered$: Observable<Sale[]>;

  date: FormControl;
  statusForm: FormControl;

  sales$: Observable<Sale[]>
  status: string[] = []

  constructor(
    private dbs: DatabaseService,
    private dialog: MatDialog,
    public datePipe: DatePipe

  ) { }


  ngOnInit() {
    this.initForms();
    this.initObservables();
  }

  initForms() {
    this.date = new FormControl({
      begin: this.getCurrentMonthOfViewDate().from,
      end: this.getCurrentMonthOfViewDate().to
    });

    this.status = Object.values(new saleStatusOptions())

    this.statusForm = new FormControl('Todos')
  }

  initObservables() {
    this.sales$ = this.date.valueChanges.pipe(
      startWith(this.date.value),
      switchMap((date: { begin: Date, end: Date }) => {
        let endDate = date.end;
        endDate.setHours(23, 59, 59);
        return this.dbs.getSales({begin: date.begin, end: endDate})
      }),
      map(sales => {
        return sales
      })
    );


    this.salesFiltered$ = combineLatest(
      this.sales$, 
      this.statusForm.valueChanges.pipe(startWith('Todos')))
      .pipe(
        map(([sales, saleState]) => {
          console.log(sales);
          let order = sales.sort((a, b) => Number(b.correlative) - Number(a.correlative))
          if(saleState == 'Todos'){
            if(this.totalPriceSubject){
              this.totalPriceSubject.next(this.giveTotalSalesPrice(order))
            }
            return order
          } else {
            if(this.totalPriceSubject){
              this.totalPriceSubject.next(this.giveTotalSalesPrice(order.filter(el => el.status == saleState)))
            }
            return order.filter(el => el.status == saleState);
          }
        }),
        shareReplay(1)
      )
  }



  onSelectDetail(data: Sale) {
    this.detailSubject.next(undefined);
    setTimeout(() => {
      this.detailSubject.next(data);
    }, 4);
  }

  onCheckDirection(el: Sale, event) {
    event.stopPropagation()
    // this.dialog.open(SaleAdressDialogComponent, {
    //   data: el,
    //   width: '80%'
    // })
  }

  getName(displayName: string): string {
    let name = displayName.split(" ");
    switch (name.length) {
      case 1:
      case 2:
        return displayName;
      default:
        return name[0] + " " + name[2];
    }
  }

  // getTotalPrice(sales: Sale[]): number {
  //   if (sales) {
  //     return sales.reduce((acc, curr) => {
  //         return curr.deliveryPrice + curr.total + acc
  //       }, 0)
  //   }
  //   else {
  //     return 0;
  //   }
  // }

  downloadXls(sales: Sale[]): void {
    console.log(sales);
    let table_xlsx: any[] = [];
    let headersXlsx = [
      'Correlativo', 
      //'Usuario', 
      'Estado', 
      'Teléfono', 
      'Dirección', 
      'Distrito', 
      'Referencia', 
      'Sub-Total', 
      'Delivery', 
      'Total', 
      'Tipo de pago',
      'Fecha de Solicitud', 
      'Fecha de Envio Deseada', 
      'Fecha de Atención',
      'Fecha de Confirmación de Solicitud', 
      'Fecha Asignada',
      'Fecha de Confirmación de Comprobante',
      'Fecha de Confirmación de Delivery', 
      'Fecha de Asignación de Conductor', 
      'Fecha de Entrega',
      'Fecha de Cancelación']

    table_xlsx.push(headersXlsx);

    sales.forEach(sale => {
      const temp = [
        sale.correlative.toString().padStart(6, "0"),
        //"Quedar con Melanie",
        //sale.createdBy.displayName,
        sale.status,
        sale.location.phone,
        sale.location.address,
        sale.location.district['name'],
        sale.location.reference,
        "S/."+this.giveTotalPrice(sale).toFixed(2),
        "S/."+sale.deliveryPrice.toFixed(2),
        (this.giveTotalPrice(sale)+sale.deliveryPrice).toFixed(2),
        typeof sale.payType == 'string' ? sale.payType : sale.payType.name+` (${sale.payType.account})`,
        sale.createdAt ? this.getXlsDate(sale.createdAt) : "---",
        sale.requestDate ? this.getXlsDate(sale.requestDate) : "---",
        sale.attendedData ? this.getXlsDate(sale.attendedData.attendedAt) : "---",
        sale.confirmedRequestData ? this.getXlsDate(sale.confirmedRequestData.confirmedAt) : "---",
        sale.confirmedRequestData ? this.getXlsDate(sale.confirmedRequestData.assignedDate) : "---",
        sale.confirmedDocumentData ? this.getXlsDate(sale.confirmedDocumentData.confirmedBy) : "---",
        sale.confirmedDeliveryData ? this.getXlsDate(sale.confirmedDeliveryData.confirmedAt) : "---",
        sale.driverAssignedData ? this.getXlsDate(sale.driverAssignedData.assignedAt) : "---",
        sale.finishedData ? this.getXlsDate(sale.finishedData.finishedAt) : "---",
        sale.cancelledData ? this.getXlsDate(sale.cancelledData.cancelledAt) : "---",
      ];

      table_xlsx.push(temp);
    })

    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(table_xlsx);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relacion_de_Ventas');

    /* save to file */
    const name = 'Relacion_de_Ventas' + '.xlsx';
    XLSX.writeFile(wb, name);
  }


  getCurrentMonthOfViewDate(): { from: Date, to: Date } {
    const date = new Date();
    const fromMonth = date.getMonth();
    const fromYear = date.getFullYear();
  
    const actualFromDate = new Date(fromYear, fromMonth, 1);
  
    const toMonth = (fromMonth + 1) % 12;
    let toYear = fromYear;
  
    if (fromMonth + 1 >= 12) {
      toYear++;
    }
  
    const toDate = new Date(toYear, toMonth, 1);
  
    return { from: actualFromDate, to: toDate };
  }

  getCorrelative(corr: number){
    return corr.toString().padStart(4, '0')
  }

  getUser(userId): Observable<string>{
    console.log("now")
    return this.dbs.getUserDisplayName(userId)
  }

  getXlsDate(date){
    let dateObj = new Date(1970);
    dateObj.setSeconds(date['seconds'])
    return this.datePipe.transform(dateObj, 'dd/MM/yyyy');
  }

  givePrice(item: SaleRequestedProducts): number {
    let amount = item['quantity']
    let price = item['product']['price']
    if(item.product.promo){
      let promo = item['product']['promoData']['quantity']
      let pricePromo = item['product']['promoData']['promoPrice']
  
      if (amount >= promo) {
        let wp = amount % promo
        let op = Math.floor(amount / promo)
        return wp * price + op * pricePromo
      } else {
        return amount * price
      }
    } else {
      return amount * price
    }
  }
  giveTotalPrice(sale: Sale): number{
    return sale.requestedProducts.reduce((a,b) => a + this.givePrice(b), 0)
  }
  giveTotalSalesPrice(sales: Sale[]): number {
    return sales.reduce((a,b)=> a + this.giveTotalPrice(b), 0)
  }
}


