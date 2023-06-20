import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { TravtronicsTokenConfig } from '../config/token-credentials.';
import { TokenModel } from '../models/token-model';
import { AuthService } from './auth.service';
import { JWTTokenService } from './jwt-token.service';

/**
 * Service which use factory to obtain the token before to boostrap
 * the application.
 */
@Injectable({
  providedIn: 'root',
})
export class ObtainTokenService {
  constructor(
    private authService: AuthService,
    private cookieService: CookieService,
    private jwtTokenService: JWTTokenService
  ) { }

  initializeToken(): Promise<TokenModel> {
    //Promise<TokenModel>

    const isToken = this.authService.getSessionCookie();
    if (!isToken || this.jwtTokenService.isTokenExpired()) {
      return this.authService
        .obtainToken(TravtronicsTokenConfig)
        .toPromise()
        .then((tokenResponse: any) => {
          // this.sessionStorage.setSession('SESSION-AUTH-TK', tokenResponse.access_token);
          /*  if(!isToken) { */
          this.authService.setSessionCookie(tokenResponse.access_token);
          /*  } */
          return tokenResponse;
        })
        .catch((error) => console.log(error));
    }
  }
}
