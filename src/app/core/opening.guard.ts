import { Injectable } from '@angular/core';
import { CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DatabaseService } from './services/database.service';
import { tap } from 'rxjs/internal/operators/tap';
import { map, switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OpeningGuard implements CanActivateChild {

  constructor(
    private router: Router,
    private dbs: DatabaseService,
    private auth: AuthService,
    private snackbar: MatSnackBar
  ) { }

  timeConverter(hours: number, minutes: number, seconds: number): number {
    let h = hours;
    let m = minutes * (1 / 60);
    let s = seconds * (1 / 3600);

    return h + m + s;
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.auth.user$.pipe(
      switchMap(user => {
        return this.dbs.opening$.pipe(
          map(res => {

            if (user?.admin) {
              return true
            }

            // Calculating the actual decimal time based in hours
            let now = new Date();
            let day = now.getDay();
            let hours = now.getHours();
            let minutes = now.getMinutes();
            let seconds = now.getSeconds();

            let time = this.timeConverter(hours, minutes, seconds);

            // Getting the opening time for the actual day adn calculating the time
            let opening_hours = parseInt(res[day - 1]['opening'].split(':')[0]);
            let opening_minutes = parseInt(res[day - 1]['opening'].split(':')[1]);

            let opening_time = this.timeConverter(opening_hours, opening_minutes, 0);

            let closing_hours = parseInt(res[day - 1]['closing'].split(':')[0]);
            let closing_minutes = parseInt(res[day - 1]['closing'].split(':')[1]);

            let closing_time = this.timeConverter(closing_hours, closing_minutes, 0);

            // Conditioning the system based in opening and closing time
            let isOpen = false;

            if (time >= opening_time && time <= closing_time) {
              isOpen = true;
            } else {
              if (time < opening_time) {
                this.snackbar.open(`Lo sentimos, estaremos atendiendo de ${res[day - 1]['opening']} a ${res[day - 1]['closing']}`, 'Aceptar', {
                  duration: 6000
                })
              }

              if (time > closing_time) {
                this.snackbar.open(`Lo sentimos, estaremos atendiendo mañana de ${res[day]['opening']} a ${res[day]['closing']}`, 'Aceptar', {
                  duration: 6000
                })
              }
            }

            return isOpen;
          }),
          tap(res => {
            if (!res) {
              this.router.navigate(['/login']);
            }
          })
        );
      })
    )

  }

}
