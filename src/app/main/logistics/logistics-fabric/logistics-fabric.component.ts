import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Buy } from 'src/app/core/models/buy.model';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { RequestCreateEditComponent } from './request-create-edit/request-create-edit.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-logistics-fabric',
  templateUrl: './logistics-fabric.component.html',
  styleUrls: ['./logistics-fabric.component.scss']
})
export class LogisticsFabricComponent implements OnInit {

  statusOptions= [
    "Todos", 'Pendiente', 'Validado'
  ]

  dateFormControl: FormControl;
  statusFormControl: FormControl;
  searchFormControl: FormControl

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initForms();
  }

  initForms(){
    let beginDate = new Date();
    let endDate = new Date();
    beginDate.setHours(0, 0, 0, 0);
    endDate.setHours(23,59,59);

    this.dateFormControl = new FormControl({
      begin:beginDate,
      end: endDate
    })

    this.statusFormControl = new FormControl("Todos")
    this.searchFormControl = new FormControl("")

    this.dateFormControl.valueChanges.subscribe(console.log);
  }

  onCreateEditRequest(edit: boolean, recipe: Request) {
    let dialogRef: MatDialogRef<RequestCreateEditComponent>;
    if (edit == true) {
      dialogRef = this.dialog.open(RequestCreateEditComponent, {
        width: '350px',
        data: {
          data: recipe,
          edit: edit
        }
      });
      dialogRef.afterClosed().subscribe(res => {
        switch (res) {
          case true:
            this.snackBar.open('La solicitud fue editada satisfactoriamente', 'Aceptar', { duration: 5000 });
            break;
          case false:
            this.snackBar.open('Ocurrió un error. Por favor, vuelva a intentarlo', 'Aceptar', { duration: 5000 });
            break;
          default:
            break;
        }
      })
    }
    else {
      dialogRef = this.dialog.open(RequestCreateEditComponent, {
        width: '350px',
        data: {
          data: null,
          edit: edit
        }
      });
      dialogRef.afterClosed().subscribe(res => {
        switch (res) {
          case true:
            this.snackBar.open('La solicitud fue creada satisfactoriamente', 'Aceptar', { duration: 5000 });
            break;
          case false:
            this.snackBar.open('Ocurrió un error. Por favor, vuelva a intentarlo', 'Aceptar', { duration: 5000 });
            break;
          default:
            break;
        }
      })
    }
  }

}
