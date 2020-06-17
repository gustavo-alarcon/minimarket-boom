import { Router } from '@angular/router';
import { SaleDialogComponent } from './../sale-dialog/sale-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'src/app/core/models/user.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { Sale, SaleRequestedProducts } from './../../../core/models/sale.model';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { DatabaseService } from 'src/app/core/services/database.service';
import { tap, take, takeLast } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
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

  dataFormGroup: FormGroup;

  payType: Array<any> = [{ name: 'Yape', account: 'Número: 987880986' }, { name: 'BCP', account: 'Cuenta: 215-56894578-69-73' }, { name: 'Interbank', account: 'Cuenta: 215-56894578-69-73' }]
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
    data: {
      photoURL: File
    }
  } = {
      resizing$: {
        photoURL: new BehaviorSubject<boolean>(false)
      },
      data: {
        photoURL: null
      }
    }

  constructor(
    private auth: AuthService,
    private snackbar: MatSnackBar,
    private fb: FormBuilder,
    private ng2ImgMax: Ng2ImgMaxService,
    private dialog: MatDialog,
    private dbs: DatabaseService,
    private af: AngularFirestore,
    private router: Router
  ) { }

  ngOnInit(): void {
    let date = new Date()
    this.now = new Date(date.getTime() + (345600000))

    this.userData$ = this.auth.user$.pipe(
      tap(res => {
        this.user = res

        if (res['salesCount'] > 0) {
          this.dataFormGroup = this.fb.group({
            email: [res['email'], [Validators.required, Validators.email]],
            dni: [res['dni'], [Validators.required, Validators.minLength(8)]],
            name: [res['realName'], [Validators.required]],
            phone: [res.contact.phone, [Validators.required, Validators.minLength(6)]],
            date: [null, [Validators.required]],
            pay: [null, [Validators.required]],
            typePay: [null, [Validators.required]],
            photoURL: [null, [Validators.required]],
            address: [res.contact.address, [Validators.required]],
            district: [res.contact.district, [Validators.required]],
            ref: [res.contact.reference, [Validators.required]]
          });
          this.dataFormGroup.get('email').disable()
          this.dataFormGroup.get('dni').disable()
          this.dataFormGroup.get('name').disable()
          this.latitud = res.contact.coord.lat
          this.longitud = res.contact.coord.lng
        } else {
          this.firstSale = true
          this.dataFormGroup = this.fb.group({
            email: [res['email'], [Validators.required, Validators.email]],
            dni: [null, [Validators.required, Validators.minLength(8)]],
            name: [res['displayName'], [Validators.required]],
            phone: [null, [Validators.required, Validators.minLength(6)]],
            date: [null, [Validators.required]],
            pay: [null, [Validators.required]],
            typePay: [null, [Validators.required]],
            photoURL: [null, [Validators.required]],
            address: [null, [Validators.required]],
            district: [null, [Validators.required]],
            ref: [null, [Validators.required]]
          });

          this.dataFormGroup.get('email').disable()
          if (res['displayName']) {
            this.name = true
          }
        }

      })
    )

    this.total = this.dbs.order.map(el => this.giveProductPrice(el)).reduce((a, b) => a + b, 0)
  }

  changeDelivery(district) {
    this.delivery = district['delivery']
  }

  roundNumber(number) {
    return Number(parseFloat(number).toFixed(1));
  }

  giveProductPrice(item) {
    if (item.product.promo) {
      let promTotalQuantity = Math.floor(item.quantity / item.product.promoData.quantity);
      let promTotalPrice = promTotalQuantity * item.product.promoData.promoPrice;
      let noPromTotalQuantity = item.quantity % item.product.promoData.quantity;
      let noPromTotalPrice = noPromTotalQuantity * item.product.price;
      return this.roundNumber(promTotalPrice + noPromTotalPrice);
    }
    else {
      return this.roundNumber(item.quantity * item.product.price)
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
    this.dataFormGroup.get(formControlName).setValue(null);
    if (image.length === 0)
      return;
    let reader = new FileReader();
    this.photos.resizing$[formControlName].next(true);

    this.ng2ImgMax.resizeImage(image[0], 10000, 426)
      .pipe(
        take(1)
      ).subscribe(result => {
        this.photos.data[formControlName] = new File([result], formControlName + result.name.match(/\..*$/));
        reader.readAsDataURL(image[0]);
        reader.onload = (_event) => {

          this.dataFormGroup.get(formControlName).setValue(reader.result);
          this.photos.resizing$[formControlName].next(false);
        }
      },
        error => {
          this.photos.resizing$[formControlName].next(false);
          this.snackbar.open('Por favor, elija una imagen en formato JPG, o PNG', 'Aceptar');
          this.dataFormGroup.get(formControlName).setValue(null);

        }
      );
  }

  save() {
    this.loading.next(true)
    this.dataFormGroup.markAsPending();
    this.dataFormGroup.disable()

    const saleCount = this.af.firestore.collection(`/db/distoProductos/config/`).doc('generalConfig');
    const saleRef = this.af.firestore.collection(`/db/distoProductos/sales`).doc();

    let order: SaleRequestedProducts[] = this.dbs.order.map(el => {
      return { product: el.product, quantity: el.quantity }
    })
    let newSale: Sale = {
      id: saleRef.id,
      correlative: '',
      document: this.dataFormGroup.get('typePay').value,
      payType: this.dataFormGroup.get('pay').value,
      location: {
        address: this.dataFormGroup.get('address').value,
        district: this.dataFormGroup.get('district').value,
        reference: this.dataFormGroup.get('ref').value,
        coord: {
          lat: this.latitud,
          lng: this.longitud
        },
        phone: this.dataFormGroup.get('phone').value
      },
      requestDate: this.dataFormGroup.get('date').value,
      createdAt: new Date(),
      createdBy: this.user,
      requestedProducts: order,
      status: 'Solicitado',
      total: this.total,
      deliveryPrice: this.delivery,
      voucher: [{
        voucherPhoto: '',
        voucherPath: ''
      }]
    }


    let userCorrelative = 1
    const ref = this.af.firestore.collection(`/users`).doc(this.user.uid);


    if (this.user.salesCount) {
      userCorrelative = this.user.salesCount + 1
    }

    this.dbs.uploadPhotoVoucher(saleRef.id, this.photos.data.photoURL).pipe(
      takeLast(1),
    ).subscribe((res: string) => {
      newSale.voucherPhoto = res;
      newSale.voucherPath = `/sales/vouchers/${saleRef.id}-${this.photos.data.photoURL.name}`;
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

          newSale.correlative = 'R' + ("0000" + newCorr).slice(-5);

          transaction.set(saleRef, newSale);
          //user
          //primera compra
          if (this.firstSale) {
            transaction.update(ref, {
              contact: newSale.location,
              realName: this.dataFormGroup.value['name'],
              dni: this.dataFormGroup.value['dni'],
              salesCount: userCorrelative
            })
          } else {
            transaction.update(ref, {
              contact: newSale.location,
              salesCount: userCorrelative
            })
          }



        });
      }).then(() => {
        this.dialog.open(SaleDialogComponent, {
          data: {
            name: this.dataFormGroup.value['name'],
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
