import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-close-cash',
  templateUrl: './close-cash.component.html',
  styleUrls: ['./close-cash.component.scss']
})
export class CloseCashComponent implements OnInit {

  dataFormGroup: FormGroup  ;
  hidePass: boolean = true;

  constructor(private fb: FormBuilder,
              private dialog: MatDialog,) { }

  ngOnInit(): void {
    this.dataFormGroup = this.fb.group({
      inicialImport: ['', Validators.required],
      
    })
  }

}
