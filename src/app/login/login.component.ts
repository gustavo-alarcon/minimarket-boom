import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  image: string = '../../assets/images/Disto_Logo1.png'

  constructor() { }

  ngOnInit(): void {
  }

}
