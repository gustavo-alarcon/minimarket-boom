import { AuthService } from 'src/app/core/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../core/services/theme.service';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  openedMenu: boolean = false;

  constructor(
    public auth: AuthService,
    public themeService: ThemeService,
    private dialog: MatDialog,

  ) { }

  ngOnInit(): void {
  }

  toggleSideMenu(): void {
    this.openedMenu = !this.openedMenu;
  }

  login(){
    this.dialog.open(LoginDialogComponent)
  }

  logout(){
    this.auth.logout();
  }

}
