import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-show-description',
  templateUrl: './show-description.component.html',
  styleUrls: ['./show-description.component.scss']
})
export class ShowDescriptionComponent implements OnInit {

  constructor(    
             @Inject(MAT_DIALOG_DATA) public data: { description: any }
) { }

  ngOnInit(): void {
  }

}
