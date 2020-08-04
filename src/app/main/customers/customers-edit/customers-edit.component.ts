import { Component, OnInit, Inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatabaseService } from 'src/app/core/services/database.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from 'src/app/core/models/user.model';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-customers-edit',
  templateUrl: './customers-edit.component.html',
  styleUrls: ['./customers-edit.component.scss']
})
export class CustomersEditComponent implements OnInit {

  loading = new BehaviorSubject<boolean>(false)
  loading$ = this.loading.asObservable()

  userForm: FormGroup

  permits: Array<string> = ['Administrador', 'Vendedora', 'Logística', 'Contabilidad']

  hidePass: boolean = true;

  

  districts$: Observable<{ delivery: number, name: string }[]>;
  filteredDistricts$: Observable<{ delivery: number, name: string }[]>;

  constructor(
    private dialogRef: MatDialogRef<CustomersEditComponent>,
    private fb: FormBuilder,
    private dbs: DatabaseService,
    private snackBar: MatSnackBar,
    private afs: AngularFirestore,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: User
  ) {}

  ngOnInit(): void {
    this.districts$ = this.dbs.getDistricts();

    this.userForm = this.fb.group({
      email: [this.data.email, [Validators.required, Validators.email]],
      name: [this.data.name ? this.data.name : '', Validators.required],
      lastname1: [this.data.lastName1 ? this.data.lastName1 : '', Validators.required],
      lastname2: [this.data.lastName2 ? this.data.lastName2 : '', Validators.required],
      dni: [this.data.dni ? this.data.dni : ''],
      phone: [this.data.contact?.phone ? this.data.contact.phone : ''],
      address: [this.data.contact?.address ? this.data.contact.address : ''],
      district: [this.data.contact?.district ? this.data.contact.district : '']
    })

    this.userForm.get('email').disable();

    this.filteredDistricts$ = combineLatest(
        this.userForm.get('district').valueChanges.pipe(startWith('')),
        this.districts$
      ).pipe(
        map(([term, districts]) => {
          let newTerm = term.name ? term.name : term;

          return districts.filter(el => el.name.toLowerCase().includes(newTerm.trim().toLowerCase()))
        })
      )
  }

  showDistrict(district: { delivery: number, name: string }): string | null {
    return district.name ? district.name : null
  }

  save(): void {
    this.userForm.markAsPending();
    this.userForm.disable()
    this.loading.next(true)

    const ref: DocumentReference = this.afs.firestore.collection(`users`).doc(this.data.uid);
    const batch = this.afs.firestore.batch();
    let updateData = {
      completeName: this.userForm.value['name'].split(" ", 1)[0] + ' ' + this.userForm.value['lastname1'].split(" ", 1)[0],
      name: this.userForm.get('name').value,
      lastName1: this.userForm.get('lastname1').value,
      lastName2: this.userForm.get('lastname2').value,
      dni: this.userForm.get('dni').value,
    }

    let contact = this.data.contact;
    contact.phone = this.userForm.value['phone'];
    contact.address = this.userForm.value['address'];
    contact.district = this.userForm.value['district'];

    updateData['contact'] = contact;

    batch.update(ref, updateData)

    batch.commit()
      .then(() => {
        this.loading.next(false);
        this.dialogRef.close();
      })
      .catch(err => {
        console.log(err);
        this.snackBar.open("Ups! parece que hubo un error ...", "Cerrar");
      })
  }

}
