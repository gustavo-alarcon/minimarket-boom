import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { DatabaseService } from 'src/app/core/services/database.service';

@Component({
  selector: 'app-store-sales',
  templateUrl: './store-sales.component.html',
  styleUrls: ['./store-sales.component.scss']
})
export class StoreSalesComponent implements OnInit {

  totalPriceSubj: BehaviorSubject<number> = new BehaviorSubject(0);
  
  constructor(
    public auth: AuthService,
    private dbs: DatabaseService
  ) { }

  ngOnInit(): void {
    this.dbs.changeTitle('Ventas tienda');
  }

}
