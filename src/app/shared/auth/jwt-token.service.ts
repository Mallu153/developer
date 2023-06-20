import { Injectable, AfterViewInit } from '@angular/core';
import jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()

/**
 * JWT token servie to extract user information from the auth token
 *
 */
export class JWTTokenService {
  // jwtToken = this.sessionStorage.getSessionStorage('SESSION-AUTH-TK');
  jwtToken = this.authService.getSessionCookie();
  decodedToken: { [key: string]: string };

  constructor(private router: Router, private authService: AuthService) { }

  decodeToken() {
    // const token = this.sessionStorage.getSessionStorage('SESSION-AUTH-TK');
    const token = this.authService.getSessionCookie();
    if (token) {
      try {
        jwt_decode(token);
      } catch (error) {
        /* this.router.navigate(['/auth']); */
        this.router.navigate(['/']);
        console.log("getDecodeToken 1");
        return true;
      }
      this.decodedToken = jwt_decode(token);
    }
  }

  getDecodeToken() {
    //  const token = this.sessionStorage.getSessionStorage('SESSION-AUTH-TK');
    const token = this.authService.getSessionCookie();
    if (token) {
      try {
        return jwt_decode(token);
      } catch (error) {
        /* this.router.navigate(['/auth']); */
        this.router.navigate(['/']);
        console.log("getDecodeToken 2");
        return true;
      }
    }
    return false;
  }

  getEmailId() {
    this.decodeToken();
    return this.decodedToken ? this.decodedToken.sub : null;
  }

  getExpiryTime() {
    this.decodeToken();
    return this.decodedToken ? this.decodedToken.exp : null;
  }

  isTokenExpired(): boolean {
    const expiryTime: number = +this.getExpiryTime();

    if (expiryTime) {

      return 1000 * expiryTime - new Date().getTime() < 5000;
    } else {
      return false;
    }
  }
}
