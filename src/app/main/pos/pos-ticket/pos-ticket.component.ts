import { Component, OnInit } from '@angular/core';

// import * as jsPDF from 'jspdf';

@Component({
  selector: 'app-pos-ticket',
  templateUrl: './pos-ticket.component.html',
  styleUrls: ['./pos-ticket.component.scss']
})
export class PosTicketComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  print(): void {
    // var doc = new jsPDF();
    // doc.text(20, 20, 'Hello world!');
    // doc.text(20, 30, 'This is client-side Javascript, pumping out a PDF.');
    // doc.addPage();
    // doc.text(20, 20, 'Do you like that?');

    // // Save the PDF
    // doc.save('Test.pdf');
  }

}
