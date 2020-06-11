import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkThemeSubject = new BehaviorSubject<boolean>(false)
  darkTheme$ = this.darkThemeSubject.asObservable()

  toggleTheme(isDark: boolean): void{
    this.darkThemeSubject.next(isDark)
  }
}
