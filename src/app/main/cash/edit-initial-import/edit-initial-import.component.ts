import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DatabaseService } from '../../../core/services/database.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-edit-initial-import',
  templateUrl: './edit-initial-import.component.html',
  styleUrls: ['./edit-initial-import.component.scss']
})
export class EditInitialImportComponent implements OnInit {
 
  dataFormGroup: FormGroup  ;

  constructor(private fb: FormBuilder,
              private dialog: MatDialog,
              private dialogRef: MatDialogRef<EditInitialImportComponent>,
              public dbs: DatabaseService,
              public auth: AuthService
              ) { }

  ngOnInit(): void {

    this.dataFormGroup = this.fb.group({
      inicialImport: ['', Validators.required],
      
    })
  }

}
