import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Product } from '../models/product.model';
import { shareReplay, map, takeLast, switchMap, take, mapTo } from 'rxjs/operators';
import { GeneralConfig } from '../models/generalConfig.model';
import { Observable, concat, of, interval } from 'rxjs';
import { User } from '../models/user.model';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  public order: {
    product: Product,
    quantity: number
  }[] = []

  constructor(
    private afs: AngularFirestore,
    private storage: AngularFireStorage,
  ) { }

  productsListRef = `db/distoProductos/productsList`;
  generalConfigDoc = this.afs.collection(`db/distoProductos/config`).doc<GeneralConfig>('generalConfig');

  //users

  getUsers(): Observable<User[]> {
    return this.afs.collection<User>(`/users`, ref => ref.orderBy("displayName", 'asc'))
      .valueChanges().pipe(
        shareReplay(1)
      );
  }

  getUsersStatic(): Observable<User[]> {
    return this.afs.collection<User>(`/users`, ref => ref.orderBy("displayName", 'asc'))
      .get().pipe(map((snap) => {
        return snap.docs.map(el => <User>el.data())
      }));
  }



  getGeneralConfigDoc(): Observable<GeneralConfig> {
    return this.generalConfigDoc.valueChanges().pipe(shareReplay(1))
  }

  //Products list
  getProductsList(): Observable<Product[]> {
    return this.afs.collection<Product>(this.productsListRef, ref => ref.orderBy("description", "asc"))
      .get().pipe(map((snap) => {
        return snap.docs.map(el => <Product>el.data())
      }));
  }

  getProductsListValueChanges() {
    return this.afs.collection<Product>(this.productsListRef, ref => ref.orderBy("description", "asc"))
      .valueChanges().pipe(
        shareReplay(1)
      );
  }

  getProductsListCategoriesValueChanges(): Observable<string[]> {
    return this.getGeneralConfigDoc().pipe(map(res => {
      if (res) {
        if (res.hasOwnProperty('categories')) {
          return res.categories
        }
        else {
          return []
        }
      } else {
        return []
      }
    }))
  }

  editCategories(categories: string[]): firebase.firestore.WriteBatch {
    let categoriesRef: AngularFirestoreDocument<GeneralConfig>
      = this.generalConfigDoc
    let batch = this.afs.firestore.batch();
    batch.set(categoriesRef.ref, { categories }, { merge: true })
    return batch;
  }

  createEditProduct(edit: boolean, product: Product, oldProduct?: Product, photo?: File): Observable<firebase.firestore.WriteBatch> {
    let productRef: DocumentReference;
    let productData: Product;
    let batch = this.afs.firestore.batch();

    //Editting
    if (edit) {
      productRef = this.afs.firestore.collection(this.productsListRef).doc(oldProduct.id);
      productData = product;
      productData.id = productRef.id;
      productData.photoURL = oldProduct.photoURL;
      productData.promo = oldProduct.promo;
    }
    //creating
    else {
      productRef = this.afs.firestore.collection(this.productsListRef).doc();
      productData = product;
      productData.id = productRef.id;
      productData.photoURL = null;
    }

    //With or without photo
    if (photo) {
      if (edit) {
        return concat(
          this.deletePhotoProduct(oldProduct.photoPath).pipe(takeLast(1)),
          this.uploadPhotoProduct(productRef.id, photo).pipe(takeLast(1))
        ).pipe(
          takeLast(1),
          map((res: string) => {
            productData.photoURL = res;
            productData.photoPath = `/products/pictures/${productRef.id}-${photo.name}`;
            batch.set(productRef, productData, { merge: true });
            return batch
          })
        )
      }
      else {
        return this.uploadPhotoProduct(productRef.id, photo).pipe(
          takeLast(1),
          map((res: string) => {
            productData.photoURL = res;
            productData.photoPath = `/productsList/pictures/${productRef.id}-${photo.name}`;
            batch.set(productRef, productData, { merge: true });
            return batch
          })
        )
      }
    }
    else {
      batch.set(productRef, productData, { merge: true });
      return of(batch);
    }
  }

  publishProduct(published: boolean, product: Product, user: User): firebase.firestore.WriteBatch {
    let productRef: DocumentReference = this.afs.firestore.collection(this.productsListRef).doc(product.id);
    let batch = this.afs.firestore.batch();
    batch.update(productRef, { published })
    return batch;
  }

  deleteProduct(product: Product): Observable<firebase.firestore.WriteBatch> {
    let productRef: DocumentReference = this.afs.firestore.collection(this.productsListRef).doc(product.id)
    let batch = this.afs.firestore.batch();
    batch.delete(productRef)
    return this.deletePhotoProduct(product.photoPath).pipe(
      takeLast(1),
      mapTo(batch)
    )
  }

  uploadPhotoProduct(id: string, file: File): Observable<string | number> {
    const path = `/productsList/pictures/${id}-${file.name}`;

    // Reference to storage bucket
    const ref = this.storage.ref(path);

    // The main task
    let uploadingTask = this.storage.upload(path, file);

    let snapshot$ = uploadingTask.percentageChanges()
    let url$ = of('url!').pipe(
      switchMap((res) => {
        return <Observable<string>>ref.getDownloadURL();
      }))

    let upload$ = concat(
      snapshot$,
      interval(1000).pipe(take(2)),
      url$)
    return upload$;
  }

  deletePhotoProduct(path: string): Observable<any> {
    let st = this.storage.ref(path);
    return st.delete();
  }

  editProductPromo(productId: string, promo: boolean, promoData: Product['promoData']): firebase.firestore.WriteBatch {
    let productRef: DocumentReference;
    let productData: Product['promoData'];
    let batch = this.afs.firestore.batch();

    //Editting
    productRef = this.afs.firestore.collection(this.productsListRef).doc(productId);
    productData = promoData;
    batch.update(productRef, {
      promo,
      promoData: {
        promoPrice: promoData.promoPrice,
        quantity: promoData.quantity
      }
    });
    return batch;
  }
}
