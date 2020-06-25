import { SaleDialogComponent } from './../sale-dialog/sale-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'src/app/core/models/user.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { Sale, SaleRequestedProducts } from './../../../core/models/sale.model';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { DatabaseService } from 'src/app/core/services/database.service';
import { tap, take, takeLast } from 'rxjs/operators';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
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
  firstSale: boolean = false

  loading = new BehaviorSubject<boolean>(false);
  loading$ = this.loading.asObservable();

  userData$: Observable<any>
  user: User = null

  name: boolean = false
  total: number = 0
  delivery: number = 4

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  payFormGroup: FormGroup;

  photosList: Array<any> = []

  payType: Array<any> = [
    { name: 'Yape', account: '987880986', image: '../../../../assets/images/logo-yape-min.png' },
    { name: 'BCP', account: '215-56894578-69-73', image: '../../../../assets/images/bcp-logo.png' },
    { name: 'Interbank', account: '215-56894578-69-73', image: '../../../../assets/images/logo_Interbank.png' }
  ]

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

  showPhoto: boolean = false
  photos: {
    resizing$: {
      photoURL: Observable<boolean>
    },
    data: File[]
  } = {
      resizing$: {
        photoURL: new BehaviorSubject<boolean>(false)
      },
      data: []
    }

  constructor(
    private auth: AuthService,
    private snackbar: MatSnackBar,
    private fb: FormBuilder,
    private ng2ImgMax: Ng2ImgMaxService,
    private dialog: MatDialog,
    private dbs: DatabaseService,
    private af: AngularFirestore
  ) { }

  ngOnInit(): void {
    let date = new Date()
    this.now = new Date(date.getTime() + (345600000))

    this.payFormGroup = this.fb.group({
      pay: [null, [Validators.required]],
      typePay: [null, [Validators.required]],
      photoURL: [null, [Validators.required]]
    });

    this.userData$ = this.auth.user$.pipe(
      tap(res => {
        this.user = res

        if (res['name'] ) {

          this.firstFormGroup = this.fb.group({
            email: [res['email'], [Validators.required, Validators.email]],
            dni: [res['dni'], [Validators.required, Validators.minLength(8)]],
            name: [res['name'], [Validators.required]],
            lastname1: [res['lastName1'], [Validators.required]],
            lastname2: [res['lastName2'], [Validators.required]],
            phone: [res.contact.phone, [Validators.required, Validators.minLength(6)]],
          });

          this.secondFormGroup = this.fb.group({
            address: [res.contact.address, [Validators.required]],
            district: [res.contact.district, [Validators.required]],
            ref: [res.contact.reference, [Validators.required]]
          });

          this.latitud = res.contact.coord.lat
          this.longitud = res.contact.coord.lng
          this.changeDelivery(res.contact.district)
        } else {
          this.firstSale = true

          this.firstFormGroup = this.fb.group({
            email: [res['email'], [Validators.required, Validators.email]],
            dni: [null, [Validators.required, Validators.minLength(8)]],
            name: [res['displayName'], [Validators.required]],
            lastname1: [null, [Validators.required]],
            lastname2: [null, [Validators.required]],
            phone: [null, [Validators.required, Validators.minLength(6)]],
          });

          this.secondFormGroup = this.fb.group({
            address: [null, [Validators.required]],
            district: [null, [Validators.required]],
            ref: [null, [Validators.required]]
          });

          if (res['displayName']) {
            this.name = true
          }
        }

      })
    )

    this.total = this.dbs.total
  }

  changeDelivery(district) {
    this.delivery = district['delivery']
  }

  roundNumber(number) {
    return Number(parseFloat(number).toFixed(1));
  }

  eliminatedphoto(ind) {
    this.photosList.splice(ind, 1)
    this.photos.data.splice(ind, 1)

    if (this.photosList.length == 0) {
      this.payFormGroup.get('photoURL').setValue(null);
    }

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

  addNewPhoto(formControlName: string, image: File[]) {
    this.payFormGroup.get(formControlName).setValue(null);
    if (image.length === 0)
      return;
    let reader = new FileReader();
    this.photos.resizing$[formControlName].next(true);

    this.ng2ImgMax.resizeImage(image[0], 10000, 426)
      .pipe(
        take(1)
      ).subscribe(result => {
        this.photos.data.push(new File([result], formControlName + this.photosList.length + result.name.match(/\..*$/)))
        reader.readAsDataURL(image[0]);
        reader.onload = (_event) => {
          this.photosList.push({
            img: reader.result,
            show: false
          })
          this.payFormGroup.get(formControlName).setValue(reader.result);
          this.photos.resizing$[formControlName].next(false);
        }
      },
        error => {
          this.photos.resizing$[formControlName].next(false);
          this.snackbar.open('Por favor, elija una imagen en formato JPG, o PNG', 'Aceptar');
          this.payFormGroup.get(formControlName).setValue(null);

        }
      );
  }

  save() {
    this.loading.next(true)

    this.payFormGroup.markAsPending();
    this.payFormGroup.disable()

    const saleCount = this.af.firestore.collection(`/db/distoProductos/config/`).doc('generalConfig');
    const saleRef = this.af.firestore.collection(`/db/distoProductos/sales`).doc();

    let newSale: Sale = {
      id: saleRef.id,
      correlative: 0,
      correlativeType: 'R',
      document: this.payFormGroup.get('typePay').value,
      payType: this.payFormGroup.get('pay').value,
      location: {
        address: this.secondFormGroup.get('address').value,
        district: this.secondFormGroup.get('district').value,
        reference: this.secondFormGroup.get('ref').value,
        coord: {
          lat: this.latitud,
          lng: this.longitud
        },
        phone: this.firstFormGroup.get('phone').value
      },
      requestDate: null,
      createdAt: new Date(),
      createdBy: null,
      user: this.user,
      requestedProducts: this.dbs.order,
      status: 'Solicitado',
      total: this.total,
      deliveryPrice: this.delivery,
      voucher: [],
      voucherChecked: false
    }


    let userCorrelative = 1
    const ref = this.af.firestore.collection(`/users`).doc(this.user.uid);


    if (this.user.salesCount) {
      userCorrelative = this.user.salesCount + 1
    }

    let photos = [...this.photos.data.map(el => this.dbs.uploadPhotoVoucher(saleRef.id, el))]


    forkJoin(photos).pipe(
      takeLast(1),
    ).subscribe((res: string[]) => {
      newSale.voucher = [...this.photos.data.map((el, i) => {
        return {
          voucherPhoto: res[i],
          voucherPath: `/sales/vouchers/${saleRef.id}-${el.name}`
        }
      })]

      return this.af.firestore.runTransaction((transaction) => {
        // This code may get re-run multiple times if there are conflicts.
        return transaction.get(saleCount).then((sfDoc) => {
          if (!sfDoc.exists) {
            transaction.set(saleCount, { salesRCounter: 0 });
          }

          //sales
          ////generalCounter
          let newCorr = 1
          if (sfDoc.data().salesRCounter) {
            newCorr = sfDoc.data().salesRCounter + 1;
          }

          transaction.update(saleCount, { salesRCounter: newCorr });

          newSale.correlative = newCorr

          transaction.set(saleRef, newSale);
          //user
          //primera compra
          if (this.firstSale) {
            transaction.update(ref, {
              contact: newSale.location,
              name: this.firstFormGroup.value['name'],
              lastName1: this.firstFormGroup.value['lastname1'],
              lastName2: this.firstFormGroup.value['lastname2'],
              dni: this.firstFormGroup.value['dni'],
              salesCount: userCorrelative
            })
          } else {
            transaction.update(ref, {
              contact: newSale.location,
              name: this.firstFormGroup.value['name'],
              lastName1: this.firstFormGroup.value['lastname1'],
              lastName2: this.firstFormGroup.value['lastname2'],
              salesCount: userCorrelative
            })
          }

        });

      }).then(() => {
        this.dialog.open(SaleDialogComponent, {
          data: {
            name: this.firstFormGroup.value['name'],
            number: newSale.correlative,
            email: this.user.email
          }
        })

        this.dbs.order = []
        this.dbs.total = 0
        this.dbs.view.next(1)
        //this.loading.next(3)
      }).catch(function (error) {
        console.log("Transaction failed: ", error);
      });
    })

  }

}
