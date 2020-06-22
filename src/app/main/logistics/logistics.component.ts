import { Component, OnInit } from '@angular/core';
import { Observable, EMPTY } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { Router, RouteConfigLoadStart, RouteConfigLoadEnd } from '@angular/router';

@Component({
  selector: 'app-logistics',
  templateUrl: './logistics.component.html',
  styleUrls: ['./logistics.component.scss']
})
export class LogisticsComponent implements OnInit {
  loading$: Observable<boolean>

  links = [
    { name: 'Fábrica', route: 'fabric' },
    { name: 'Disponibilidad', route: 'availability' },
    { name: 'Devoluciones', route: 'returns' }
  ];

  activeLink = this.links[0];

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loading$ = this.router.events.pipe(
      filter(event => event instanceof RouteConfigLoadStart||event instanceof RouteConfigLoadEnd ),
      map(event => {
        if (event instanceof RouteConfigLoadStart) {
          return true;
        }
        if (event instanceof RouteConfigLoadEnd) {
          return false;
        }
      })
    )
  }
}
