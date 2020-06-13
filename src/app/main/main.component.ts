import { AuthService } from 'src/app/core/services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  openedMenu: boolean = false;

  constructor(
    public auth: AuthService
  ) { }

  ngOnInit(): void {
  }

  toggleSideMenu(): void {
    this.openedMenu = !this.openedMenu;
  }

  login(){
    console.log('iniciando sesion')
  }

  logout(){
    console.log('cerrando sesion')
  }

  toggleLight(){
    console.log('light style')
  }

  toggleDark(){
    console.log('dark style')
  }
}
