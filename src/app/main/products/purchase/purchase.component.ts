import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.scss']
})
export class PurchaseComponent implements OnInit {

  userData$: Observable<any>

  total: number = 0
  delivery: number = 4

  dataFormGroup: FormGroup;

  payType: Array<string> = ['Efectivo', 'VISA', 'Mastercard', 'Transferencia', 'Yape']
  documents: Array<string> = ['Boleta', 'Factura']
  districts: Array<any> = [{
    name: 'Cercado',
    delivery: 5
  },
  {
    name: 'Miraflores',
    delivery: 4
  },
  {
    name: 'Paucarpata',
    delivery: 7
  },
  {
    name: 'Alto Selva Alegre',
    delivery: 6
  }]

  now: Date

  latitud: number = -16.3988900
  longitud: number = -71.5350000
  constructor(
    private auth: AuthService,
    private snackbar: MatSnackBar,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    let date = new Date()
    this.now = new Date(date.getTime() + 86400000)

    this.dataFormGroup = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      dni: [null, [Validators.required]],
      name: [null, [Validators.required]],
      phone: [null, [Validators.required]],
      date: [null, [Validators.required]],
      pay: [null, [Validators.required]],
      typePay: [null, [Validators.required]],
      photo: [null, [Validators.required]],
      address: [null, [Validators.required]],
      district: [null, [Validators.required]],
      ref: [null, [Validators.required]]
    });

    this.userData$ = this.auth.user$.pipe(
      tap(res => {
        console.log(res);
        
        this.dataFormGroup.setValue({
          email: res['email'],
          dni: null,
          name: res['displayName'],
          phone: null,
          date: null,
          pay: null,
          typePay: null,
          photo: null,
          address: null,
          district: null,
          ref: null
        })
      })
    )
  }

  changeDelivery(district) {
    this.delivery = district['delivery']
  }

  compareObjects(o1: any, o2: any): boolean {
    return o1.name === o2.name && o1.delivery === o2.delivery;
  }

  findMe() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((posicion) => {
        this.latitud = posicion.coords.latitude;
        this.longitud = posicion.coords.longitude;

      }, function (error) {
        alert("Tenemos un problema para encontrar tu ubicación");
      });
    }
  }

  mapClicked($event: MouseEvent) {
    this.latitud = $event['coords']['lat'];
    this.longitud = $event['coords']['lng'];
  }

}
