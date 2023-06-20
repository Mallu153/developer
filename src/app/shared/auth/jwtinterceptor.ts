import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HTTP_INTERCEPTORS, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { JWTTokenService } from './jwt-token.service';
import { environment } from 'environments/environment';
import { ToastrService } from 'ngx-toastr';
import { RefreshTokenResponse } from '../models/login-response';
const TOKEN_HEADER_KEY = 'Authorization';
const LOGIN_PAGE = 'pages/login';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  constructor(
    private authService: AuthService,
    private toastrService: ToastrService,
    private jwtTokenService: JWTTokenService,
  ) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<Object>> {

    let authReq = req;
    const token = this.authService.getSessionCookie();
    //const token = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJQWGZxdjBpd1l5Z0hVZkpjZ0tpY0lCSkFGbmhvLVFFY0ZoWUhDMHBNbGlvIn0.eyJleHAiOjE2NzIxMjg1MDQsImlhdCI6MTY3MjEyNDkwNCwianRpIjoiN2FmMmFhNzgtOWQxOC00NTI4LWIwMDAtNWNmYmQ5Yjg2NWQ0IiwiaXNzIjoiaHR0cDovLzE5Mi4xNzguMTAuMTMyOjgwODAvYXV0aC9yZWFsbXMvVHJhdnRyb25pY3MiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiOWVmNTMyOWUtNGI2Ni00NTY3LWFmNzgtOGZjOTA5NmYyYjc0IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoidHJhdnRyb25pY3MtYXBwIiwic2Vzc2lvbl9zdGF0ZSI6IjEwMTQ0Mzg5LWJlZDUtNDE2Ni04ODU5LWQyYmZmNzZkZTU5MCIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiIsImRlZmF1bHQtcm9sZXMtdHJhdnRyb25pY3MiXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6InByb2ZpbGUgZW1haWwiLCJzaWQiOiIxMDE0NDM4OS1iZWQ1LTQxNjYtODg1OS1kMmJmZjc2ZGU1OTAiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInd0UHJvZmlsZSI6ImFkbWluIiwibmFtZSI6IlN1cGVyIEFkbWluIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW5AdHJhdnRyb25pY3MuY29tIiwiZ2l2ZW5fbmFtZSI6IlN1cGVyIiwiZmFtaWx5X25hbWUiOiJBZG1pbiIsInVzZXJJZCI6MTAwMCwiZW1haWwiOiJhZG1pbkB0cmF2dHJvbmljcy5jb20iLCJ3dElkIjoxfQ.YuL9OB4Sat9wVCzTbCUxqQLTKAF8zYiBFTnujYAvYPtudJ1LTcPZh6SeNcbyUJ3Ji9T54d44wNry1hh09q_ZBM_PPbdOEYi42ass9uP9PKFnkVWPc_hZ8osSQNrDMmFQUw_O9uWfmJXtNqdf-8Pa7Gx41t7vBkHuvDC6tqw77HmVzmZuqlw8EdXl0yD5D6hGmfCaXRMa7Wiv1hBl-Y2JnCJ1Zlwtcpoo4cMIaotwqtPIYayWm9G5rAhXvZpjt-zbuF6mjD5ePckKvS5Wsw7Yh-jDtDA_M92V-d9bG4BV7GowoSPJkJwCovW-xkh6oV6U_-o7inAhI_VgTXaYb5mheQ";
    const tokenTime = this.jwtTokenService.isTokenExpired();
    if (authReq.url === environment.FLEX_PRICE) {
    } else if (authReq.url === environment.AMADEUSTOKEN) {
    } else {
      if (token != null) {
        authReq = this.addTokenHeader(req, token);
      }
    }
    return next?.handle(authReq).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && !authReq.url.includes(LOGIN_PAGE) && error.status === 401) {
          return this.handle401Error(authReq, next);
        }
        if (tokenTime) {
          return this.handle401Error(authReq, next);
        }

        return throwError(error);
      })
    );

  }
  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      const refreshToken = this.authService.getRefreshToken();
      if (refreshToken){
        return this.authService.refreshToken(JSON.parse(refreshToken)).pipe(
          switchMap((token: RefreshTokenResponse) => {
            if(token?.access_token){
              this.isRefreshing = false;
              this.authService.setSessionCookie(token?.access_token);
              this.refreshTokenSubject.next(token?.access_token);
              return next.handle(this.addTokenHeader(request, token?.access_token));
            }else{
            this.toastrService.error('Session expired please login.');
            this.authService.logout();
            }

          }),
          catchError((err) => {
            this.isRefreshing = false;
            console.log('refresh token error', err);
            this.toastrService.error('Session expired please login.');
            this.authService.logout();
            return throwError(err);
          })
        );
      }else{
        this.toastrService.error('Session expired please login.');
        this.authService.logout();
      }

    }
    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(request, token)))
    );
  }
  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({ headers: request.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token) });
  }
}
