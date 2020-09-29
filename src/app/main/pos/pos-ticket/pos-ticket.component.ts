import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Ticket } from 'src/app/core/models/ticket.model';
import { AuthService } from 'src/app/core/services/auth.service';

// import * as jsPDF from 'jspdf';

@Component({
  selector: 'app-pos-ticket',
  templateUrl: './pos-ticket.component.html',
  styleUrls: ['./pos-ticket.component.scss']
})
export class PosTicketComponent implements OnInit {

  now = new Date();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Ticket,
    public auth: AuthService
  ) {

  }

  ngOnInit(): void {

  }

  print(): void {
    // window.print();
  }

}
