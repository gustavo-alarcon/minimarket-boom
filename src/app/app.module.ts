import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

//Firebase
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';

//dep
import {LazyLoadImageModule} from 'ng-lazyload-image';


//Components
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig, "disto-productos"),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    LazyLoadImageModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
