import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { Sale, saleStatusOptions } from 'src/app/core/models/sale.model';
import { shareReplay, startWith, switchMap, map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { DatabaseService } from 'src/app/core/services/database.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-sales-master',
  templateUrl: './sales-master.component.html',
  styleUrls: ['./sales-master.component.scss']
})
export class SalesMasterComponent implements OnInit {
  @Input() detailSubject: BehaviorSubject<Sale>

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
    private dialog: MatDialog
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
            return sales
          } else {
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
  //   let table_xlsx: any[] = [];
  //   let headersXlsx = [
  //     'Correlativo', 'Usuario', 'Estado', 'Teléfono', 'Dirección', 
  //     'Distrito', 'Referencia', 'Sub-Total', 'Delivery', 'Total', 'Tipo de pago',
  //     'Fecha de Solicitud', 'Fecha de Envio Deseada', 'Fecha de Confirmación/Cancelación', 'Fecha de Despacho', 
  //     'Fecha de Entrega']

  //   table_xlsx.push(headersXlsx);

  //   sales.forEach(sale => {
  //     const temp = [
  //       sale.correlative.toString().padStart(6, "0"),
  //       sale.createdBy.displayName,
  //       sale.status,
  //       sale.location.number,
  //       sale.location.address,
  //       sale.location.district,
  //       sale.location.reference,
  //       (sale.status == 'Solicitado' || sale.status == 'Cancelado') ? sale.total : sale.totalConfirmedPrice,
  //       (sale.status == 'Solicitado' || sale.status == 'Cancelado') ? sale.deliveryPrice : sale.deliveryConfirmedPrice,
  //       (sale.status == 'Solicitado' || sale.status == 'Cancelado') ? (sale.deliveryPrice + sale.total) : (sale.deliveryConfirmedPrice + sale.totalConfirmedPrice),
  //       sale.payType,
  //       sale.createdAt,
  //       sale.deliveryDate,
  //       (sale.status == 'Solicitado') ? "N.A." : (sale.status == 'Cancelado') ? sale.cancelledAt : sale.confirmedAt,
  //       (sale.status == 'Solicitado' || sale.status == 'Cancelado' || sale.status == 'Confirmado') ? "N.A." : sale.dispatchedAt,
  //       (sale.status == 'Solicitado' || sale.status == 'Cancelado' || sale.status == 'Confirmado' || sale.status == 'En reparto') ? "N.A." : sale.deliveryFinishedDate,
  //     ];

  //     table_xlsx.push(temp);
  //   })

  //   /* generate worksheet */
  //   const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(table_xlsx);

  //   /* generate workbook and add the worksheet */
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Relacion_de_Ventas');

  //   /* save to file */
  //   const name = 'Relacion_de_Ventas' + '.xlsx';
  //   XLSX.writeFile(wb, name);
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
}


