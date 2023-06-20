import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule } from '@agm/core';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';

import {
  PerfectScrollbarModule,
  PERFECT_SCROLLBAR_CONFIG,
  PerfectScrollbarConfigInterface,
} from 'ngx-perfect-scrollbar';

import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { ContentLayoutComponent } from './layouts/content/content-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CookieService } from 'ngx-cookie-service';

import { AuthService } from './shared/auth/auth.service';
import { AuthGuard } from './shared/auth/auth-guard.service';
import { WINDOW_PROVIDERS } from './shared/services/window.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { JwtHelperService, JWT_OPTIONS } from '@auth0/angular-jwt';
import { initTokenFactory } from './shared/factory/obtain-token-factory';
import { ObtainTokenService } from './shared/auth/obtain-token.service';
import { JWTTokenService } from './shared/auth/jwt-token.service';
import { JwtInterceptor } from './shared/auth/jwtinterceptor';
import { PopoverModule } from 'ngx-smart-popover';
import { ChatService } from './shared/services/chat/chat.service';


var firebaseConfig = {
  apiKey: 'YOUR_API_KEY', //YOUR_API_KEY
  authDomain: 'YOUR_AUTH_DOMAIN', //YOUR_AUTH_DOMAIN
  databaseURL: 'YOUR_DATABASE_URL', //YOUR_DATABASE_URL
  projectId: 'YOUR_PROJECT_ID', //YOUR_PROJECT_ID
  storageBucket: 'YOUR_STORAGE_BUCKET', //YOUR_STORAGE_BUCKET
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID', //YOUR_MESSAGING_SENDER_ID
  appId: 'YOUR_APP_ID', //YOUR_APP_ID
  measurementId: 'YOUR_MEASUREMENT_ID', //YOUR_MEASUREMENT_ID
};

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelPropagation: false,
};

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ContentLayoutComponent
  ],
  imports: [
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    HttpClientModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    NgbModule,

    NgxSpinnerModule,
    ToastrModule.forRoot(),
    Ng2SearchPipeModule,
    PopoverModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    AgmCoreModule.forRoot({
      apiKey: 'YOUR_GOOGLE_MAP_API_KEY',
    }),
    PerfectScrollbarModule,
  ],
  providers: [
    DatePipe,
    ChatService,
    AuthService,
    CookieService,
    JwtHelperService,
    {
      provide: JWT_OPTIONS,
      useValue: JWT_OPTIONS,
    },
    AuthGuard,
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG },
    WINDOW_PROVIDERS,
    /* {
      provide: APP_INITIALIZER,
      useFactory: initTokenFactory,
      deps: [ObtainTokenService],
      multi: true,
    }, */
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    JWTTokenService,
    ObtainTokenService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
