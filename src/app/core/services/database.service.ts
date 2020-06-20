import { Sale, saleStatusOptions } from './../models/sale.model';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Product } from '../models/product.model';
import { shareReplay, map, takeLast, switchMap, take, mapTo } from 'rxjs/operators';
import { GeneralConfig } from '../models/generalConfig.model';
import { Observable, concat, of, interval, BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
import { AngularFireStorage } from '@angular/fire/storage';
import { Recipe } from '../models/recipe.model';
import { Unit } from '../models/unit.model';
import { Buy, BuyRequestedProduct } from '../models/buy.model';
import * as firebase from 'firebase'

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  public order: {
    product: Product,
    quantity: number
  }[] = []

  public view = new BehaviorSubject<number>(1);
  public view$ = this.view.asObservable();

  public total: number = 0

  constructor(
    private afs: AngularFirestore,
    private storage: AngularFireStorage,
  ) { }

  productsListRef = `db/distoProductos/productsList`;
  recipesRef = `db/distoProductos/recipes`;
  buysRef=`db/distoProductos/buys`;
  salesRef=`db/distoProductos/sales`;
  configRef = `db/distoProductos/config`;
  generalConfigDoc = this.afs.collection(this.configRef).doc<GeneralConfig>('generalConfig');

  getCurrentMonthOfViewDate(): { from: Date, to: Date } {
    const date = new Date();
    const fromMonth = date.getMonth();
    const fromYear = date.getFullYear();

    const actualFromDate = new Date(fromYear, fromMonth, 1);

    const toMonth = (fromMonth + 1) % 12;
    let toYear = fromYear;

    if (fromMonth + 1 >= 12) {
      toYear++;
    }

    const toDate = new Date(toYear, toMonth, 1);

    return { from: actualFromDate, to: toDate };
  }

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

  getProductsListUnitsValueChanges(): Observable<Unit[]> {
    return this.getGeneralConfigDoc().pipe(map(res => {
      if (res) {
        if (res.hasOwnProperty('units')) {
          return res.units
        }
        else {
          return []
        }
      } else {
        return []
      }
    }), shareReplay(1))
  }

  editCategories(categories: string[]): firebase.firestore.WriteBatch {
    let categoriesRef: AngularFirestoreDocument<GeneralConfig>
      = this.generalConfigDoc
    let batch = this.afs.firestore.batch();
    batch.set(categoriesRef.ref, { categories }, { merge: true })
    return batch;
  }

  editUnits(units: Unit[]): firebase.firestore.WriteBatch {
    let unitsRef: AngularFirestoreDocument<GeneralConfig>
      = this.generalConfigDoc
    let batch = this.afs.firestore.batch();
    batch.set(unitsRef.ref, { units }, { merge: true })
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
            productData.photoPath = `/productsList/pictures/${productRef.id}-${photo.name}`;
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

  //Products
  createEditRecipe(recipe: Recipe, edit: boolean): firebase.firestore.WriteBatch{
    let recipeRef: DocumentReference;
    let recipeData: Recipe = recipe;
    let batch = this.afs.firestore.batch();
    if(edit){
      recipeRef = this.afs.firestore.collection(this.recipesRef).doc(recipe.id);
    } else{
      recipeRef = this.afs.firestore.collection(this.recipesRef).doc();
      recipeData.id = recipeRef.id;
    }
    batch.set(recipeRef, recipeData);
    return batch;
  }

  getRecipes(): Observable<Recipe[]>{
    return this.afs.collection<Recipe>(this.recipesRef, ref => ref.orderBy("name", "asc"))
      .get().pipe(map((snap) => {
        return snap.docs.map(el => <Recipe>el.data())
      }));
  }

  /*sales*/

  uploadPhotoVoucher(id: string, file: File): Observable<string | number> {
    const path = `/sales/vouchers/${id}-${file.name}`;

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

  
  getProductRecipesValueChanges(productId: string): Observable<Recipe[]>{
    return this.afs.collection<Recipe>(this.recipesRef, 
      ref => ref.where("productsId", "array-contains", productId)).valueChanges()
  }

  getSalesUser(user:string): Observable<Sale[]>{
    return this.afs.collection<Sale>(`/db/distoProductos/sales`, 
      ref => ref.where("userId", "==", user)).valueChanges()
  }

  //Logistics
  getBuysCorrelativeValueChanges(): Observable<number> {
    return this.getGeneralConfigDoc().pipe(map(res => {
      if (res) {
        if (res.hasOwnProperty('buysCounter')) {
          return res.buysCounter + 1
        }
        else {
          return 0
        }
      } else {
        return 0
      }
    }), shareReplay(1))
  }

  getBuyRequests(date: {begin: Date, end: Date}): Observable<Buy[]>{
    return this.afs.collection<Buy>(this.buysRef, 
      ref => ref.where("requestedDate", "<=", date.end).where("requestedDate", ">=", date.begin))
      .valueChanges().pipe(map(res => res.sort((a,b) => b.correlative - a.correlative)));
  }

  createEditBuyRequest(request: Buy, requestedProducts: BuyRequestedProduct[], edit: boolean, oldBuyRequest: Buy):
  Promise<void>{

    let configRef: DocumentReference = this.afs.firestore.collection(this.configRef).doc('generalConfig');

    let buyRef: DocumentReference = !edit ? this.afs.firestore.collection(this.buysRef).doc() : 
                                    this.afs.firestore.collection(this.buysRef).doc(oldBuyRequest.id);

    let buyData: Buy = request;
    buyData.id = buyRef.id;

    let requestedProductRef: DocumentReference;
    let requestedProductData: BuyRequestedProduct;

    let batch = this.afs.firestore.batch()

    if(edit){
      //adding docs for requested products
      requestedProducts.forEach(product => {
        requestedProductRef = this.afs.firestore.collection(
          this.buysRef +`/${buyRef.id}/buyRequestedProducts`).doc(product.id)
        requestedProductData = product;
        requestedProductData.buyId = buyRef.id;
        batch.set(requestedProductRef, requestedProductData);
      })
      //deleting deleted products
      let deletedProducts = oldBuyRequest.requestedProducts.filter(el => 
        !request.requestedProducts.find(el2 => el2 == el)
        )
      deletedProducts.forEach(productId => {
        requestedProductRef = this.afs.firestore.collection(
          this.buysRef +`/${buyRef.id}/buyRequestedProducts`).doc(productId)
        batch.delete(requestedProductRef);
      })
      //buy data
      batch.set(buyRef, buyData);

      return batch.commit()    

    } else{
      return this.afs.firestore.runTransaction((transaction) => {
        // This code may get re-run multiple times if there are conflicts.
        return transaction.get(configRef).then((sfDoc) => {

            //adding docs for requested products
            requestedProducts.forEach(product => {
              requestedProductRef = this.afs.firestore.collection(
                this.buysRef +`/${buyRef.id}/buyRequestedProducts`).doc(product.id)
              requestedProductData = product;
              requestedProductData.buyId = buyRef.id;
              transaction.set(requestedProductRef, requestedProductData);
            })

            //counter
            if (!sfDoc.exists) {
                transaction.set(configRef, {buysCounter: 0}, {merge: true});
            } else{
              let config = <GeneralConfig>sfDoc.data()

              if(!config.hasOwnProperty("buysCounter")){
                transaction.set(configRef, {buysCounter: 0}, {merge: true});
                buyData.correlative = 0;
                transaction.set(buyRef, buyData);
              } else {
                transaction.update(configRef, {buysCounter: config.buysCounter+1})
                buyData.correlative = config.buysCounter+1;
                transaction.set(buyRef, buyData);
              }
            }
        });
      });
    }
  }

  getBuyRequestedProducts(request: string): Observable<BuyRequestedProduct[]> {
    return this.afs.collection<BuyRequestedProduct>(this.buysRef +`/${request}/buyRequestedProducts`, 
      ref => ref.orderBy("productDescription")).valueChanges();
  }

  getVirtualStock(product: Product): Observable<BuyRequestedProduct[]>{
    return this.afs.collectionGroup<BuyRequestedProduct>('buyRequestedProducts', 
      ref => ref.where("id", "==", product.id).where("validated", "==", false)).valueChanges()
  }

  //Sales
  getSales(date: {begin: Date, end: Date}): Observable<Sale[]>{
    return this.afs.collection<Sale>(this.salesRef, 
      ref => ref.where("createdAt", "<=", date.end).where("createdAt", ">=", date.begin))
      .valueChanges();
  }

}
