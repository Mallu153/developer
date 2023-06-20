import { Router, NavigationStart, Event as NavigationEvent, ActivatedRoute } from '@angular/router';
import { Injectable, OnInit } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { APPROLES } from '../data/app-roles';
import { ObtainToken } from '../models/obtain-token';
import { TokenModel } from '../models/token-model';
import { environment } from 'environments/environment';
import { TravtronicsTokenConfig } from '../config/token-credentials.';
import { LoginModel, LoginResponse, verifyToken } from '../models/login-response';
import { catchError } from 'rxjs/operators';
import { LohinResponseSendPHP } from '../models/login-After-Hit-model';
import { LoginAfterHitResponse } from '../models/login-After-Hit.respones';
import { ENVIRONMENT_MODES } from '../config/development-mode';
import { RouteInfo } from '../components/vertical-menu/vertical-menu.metadata';
import { EncrDecrServiceService } from '../services/encr-decr-service.service';
import { CustomerDetails } from '../models/customer-details';
import { RequestDetails } from '../models/request-header';
const PAGE_PERMISSION_KEY = 'has-page';
const MENU_DATA = 'menu';
const CUSTOMER_TYPE_DATA = 'customerType';
const REQUEST_DATA = 'srRequest';

export class VerifyToken{
token: string;
}
@Injectable()
export class AuthService {
  private static projectKey = 'TRAVEL';
  //developement url
  serverUrl = environment.USERMANAGEMENT;
  loginAfterHit = environment.loginAfterHit;
  refreshTokenUrl = environment.REFRESHTOKEN;
  isTokenGet: boolean = false;
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(
    public jwtHelper: JwtHelperService,
    private http: HttpClient,
    private cookieService: CookieService,
    public router: Router,
    private route: ActivatedRoute,
    private EncrDecr: EncrDecrServiceService
  ) {
    //this.getLoginttuserId();
  }

  //login after hit service call
  loginAfterCall(payload: LohinResponseSendPHP): Observable<LoginAfterHitResponse> {
    return this.http
      .post<LoginAfterHitResponse>(`${this.loginAfterHit}common/mongo/insert_collection`, payload)
      .pipe(catchError(this.errorHandler));
  }

  refreshToken(token: string) {
    return this.http.post(
      `${this.serverUrl}` + 'auth/refresh-token',
      {
        token: token,
      },
      this.httpOptions
    );
  }

  /**
   * A method to handle user sign up
   * @param pyaload UserModel
   */
  /* signUp(payload: UserModel): Observable<signInReponse> {
      const signUpUrl = this.urlRegisterService.getUrl('signUp');
      return this.http.post<signInReponse>(`${this.serverUrl}/${signUpUrl}`, payload);
    } */
  /**
   * A method to handle user login
   * @param pyaload UserModel
   */
  signIn(payload: LoginModel): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.serverUrl}auth/userLogin`, payload)
      .pipe(catchError(this.errorHandler));
  }
  verifyToken(token: string): Observable<verifyToken> {
    return this.http
      .post<verifyToken>(`${this.serverUrl}auth/verifyToken`, {
        token: token,
      },)
      .pipe(catchError(this.errorHandler));
  }

  /**
   * A method to optain the token before to consume API
   * @param payload ObtainToken
   * @returns
   */
  obtainToken(payload: ObtainToken): Observable<TokenModel> {
    return this.http.post<TokenModel>(`${this.serverUrl}auth/obtainToken`, payload);
  }
  obtainTokenFromLogout(payload: ObtainToken): Observable<TokenModel> {
    return this.http.post<TokenModel>(`${this.serverUrl}auth/obtainToken`, payload).pipe(catchError(this.errorHandler));
  }
  /**
   * @whatItDoes set cookies after login
   * @param token
   * @param userId
   * @param role
   */
  setCookies(
    token: string,
    userId: string,
    role: string[],
    userName: string,
    costCenterId: number,
    locationId: number,
    orgId: number,
    ttUserId: number,
    wtId: number,
    wtProfile: string,
    refresh_token: string,
    roleId: number,
    roleName: string,
    roleKey: string,
    bizId: number,
    bizName: string,
    contactId: number,
    contactName: string,
    pagePath: string
  ) {
    const encryptedToken: string = btoa(escape(token));
    const data = {
      userId: userId,
      userName: userName,
      costCenterId: costCenterId,
      locationId: locationId,
      orgId: orgId,
      ttUserId: ttUserId,
      wtId: wtId,
      wtProfile: wtProfile,
      roleId: roleId,
      roleName: roleName,
      roleKey: roleKey,
      bizId: bizId,
      bizName: bizName,
      contactId: contactId,
      contactName: contactName,
      pagePath: pagePath,
    };

    const encryptedUserId: string = btoa(JSON.stringify(data));

    /* for (let i = 0; i < role.length; i++) {
      if (role[i] === 'App Admin') {
        role[i] = APPROLES.ADMIN;
      } else if (role[i] === 'travelagent') {
        role[i] = APPROLES.TRAVELAGENT;
      } else if (role[i] === 'callcenteragent') {
        role[i] = APPROLES.CALLCENTERAGENT;
      } else if (role[i] === 'systemadmin') {
        role[i] = APPROLES.SYSTEMADMIN;
      }
    } */
    //const encryptedRole: string = btoa(JSON.stringify(role));

    const encryptedRefreshToken: string = btoa(JSON.stringify(refresh_token));
    if (encryptedToken && encryptedUserId) {
      // dev environment setup
      if (environment.ENVIRONMENT_MODE === ENVIRONMENT_MODES.DEVELOPMENT || environment.ENVIRONMENT_MODE === ENVIRONMENT_MODES.UAT) {
        this.cookieService.set(AuthService.projectKey + '-' + 'AUTH-TK', encryptedToken, 1, '/', '.dev.com');
        this.cookieService.set(AuthService.projectKey + '-' + 'AUTH-U', encryptedUserId, 1, '/', '.dev.com');
        //this.cookieService.set(AuthService.projectKey + '-' + 'AUTH-R', encryptedRole, 1, '/', '.dev.com');
        this.cookieService.set(
          AuthService.projectKey + '-' + 'AUTH-REFRESH-TK',
          encryptedRefreshToken,
          1,
          '/',
          '.dev.com'
        );
        this.cookieService.set('jrt', token, 1, '/', '.dev.com');
        return true;
        // localhost setup
      } else if (environment.ENVIRONMENT_MODE === ENVIRONMENT_MODES.LOCALHOST) {
        this.cookieService.set(AuthService.projectKey + '-' + 'AUTH-TK', encryptedToken, 1, '/');
        this.cookieService.set(AuthService.projectKey + '-' + 'AUTH-U', encryptedUserId, 1, '/');
        //this.cookieService.set(AuthService.projectKey + '-' + 'AUTH-R', encryptedRole, 1, '/');
        this.cookieService.set(AuthService.projectKey + '-' + 'AUTH-REFRESH-TK', encryptedRefreshToken, 1, '/');
        this.cookieService.set('jrt', token, 1, '/');
        return true;
      }
      // this.cookieService.set(AuthService.projectKey + '-' + 'SESSION-AUTH-TK', encryptedToken, 1, '/','.manyrx.com', true, 'Strict');
      //   this.cookieService.set(AuthService.projectKey + '-' + 'SESSION-AUTH-U', encryptedUserId, 1, '/','.manyrx.com', true, 'Strict');
      //this.cookieService.set(AuthService.projectKey + '-' + 'SESSION-AUTH-R', encryptedRole, 1, '/','.manyrx.com', true, 'Strict');
      return false;
    } else {
      return false;
    }
  }
  setSessionCookie(token: string) {
    const encryptedToken: string = btoa(escape(token));
    if (encryptedToken) {
      // dev environment setup
      if (environment.ENVIRONMENT_MODE === ENVIRONMENT_MODES.DEVELOPMENT || environment.ENVIRONMENT_MODE === ENVIRONMENT_MODES.UAT) {
        this.cookieService.set(AuthService.projectKey + '-' + 'AUTH-TK', encryptedToken, 1, '/', '.dev.com');
        this.cookieService.set('jrt', token, 1, '/', '.dev.com');

        // localhost setup
      } else if (environment.ENVIRONMENT_MODE === ENVIRONMENT_MODES.LOCALHOST) {
        this.cookieService.set(AuthService.projectKey + '-' + 'AUTH-TK', encryptedToken, 1, '/');
        this.cookieService.set('jrt', token, 1, '/');
      }
      // this.cookieService.set(AuthService.projectKey + '-' + 'SESSION-AUTH-TK', encryptedToken, 1, '/','.manyrx.com', true, 'Strict');
    }
  }
  getSessionCookie() {
    const sessionToken = atob(unescape(this.cookieService.get(`${AuthService.projectKey}-AUTH-TK`)));
    if (sessionToken) {
      return sessionToken;
    } else {
      this.logout();
      return null;
    }
  }
  getJRTCookie() {
    const JRT = this.cookieService.get('jrt');
    if (JRT) {
      return JRT;
    } else {
      this.logout();
      return null;
    }
  }
  getTokenFromSessionStorage() {
    //const sessionToken = sessionStorage.setItem("AUTH-TK", accessToken.access_token);
    const sessionToken = sessionStorage.getItem('AUTH-TK');
    if (sessionToken) {
      return sessionToken;
    } else {
      return null;
    }
  }

  getToken() {
    if (!this.isTokenGet) {
      this.isTokenGet = true;
      this.obtainTokenFromLogout(TravtronicsTokenConfig).subscribe(
        (tokenResponse: any) => {
          // this.sessionStorage.setSession('SESSION-AUTH-TK', tokenResponse.access_token);
          //  this.cookieService.deleteAll('/');
          this.setSessionCookie(tokenResponse.access_token);
          //this.router.navigate(['/']);

          //  this.router.navigate(['/pages/login']);
        },
        (error) => {
          //this.router.navigate(['/']);
          //  this.router.navigate(['/pages/login']);
        }
      );
    }
  }
  getRefreshToken(): string {
    const refreshToken = atob(this.cookieService.get(`${AuthService.projectKey}-AUTH-REFRESH-TK`));
    if (refreshToken) {
      return refreshToken;
    }
    return '';
  }
  getWaUser() {
    const getUser = atob(this.cookieService.get(`${AuthService.projectKey}-AUTH-U`));
    if (getUser) {
      const user = JSON.parse(getUser);
      if (user) {
        return user.wtId;
      }
    }
  }

  getUser() {
    const getUser = atob(this.cookieService.get(`${AuthService.projectKey}-AUTH-U`));
    if (getUser) {
      const user = JSON.parse(getUser);
      if (user) {
        return user.userId;
      }
    }
  }
  getUserCostCenter() {
    const getUser = atob(this.cookieService.get(`${AuthService.projectKey}-AUTH-U`));
    if (getUser) {
      const user = JSON.parse(getUser);
      if (user) {
        return user.costCenterId;
      }
    }
  }
  getUserLocation() {
    const getUser = atob(this.cookieService.get(`${AuthService.projectKey}-AUTH-U`));
    if (getUser) {
      const user = JSON.parse(getUser);
      if (user) {
        return user.locationId;
      }
    }
  }
  getUserOrganization() {
    const getUser = atob(this.cookieService.get(`${AuthService.projectKey}-AUTH-U`));
    if (getUser) {
      const user = JSON.parse(getUser);
      if (user) {
        return user.orgId;
      }
    }
  }

  getUserName(): string {
    const getUser = atob(this.cookieService.get(`${AuthService.projectKey}-AUTH-U`));
    if (getUser) {
      const user = JSON.parse(getUser);
      if (user) {
        return user.userName;
      }
      return null;
    }
    return null;
  }
  //ttUserId
  getLoginttuserId() {
    const getUser = atob(this.cookieService.get(`${AuthService.projectKey}-AUTH-U`));
    if (getUser) {
      const user = JSON.parse(getUser);
      if (user) {
        return user.ttUserId;
      }
    }
  }

  isUserLoggedIn() {
    const sessionToken = atob(unescape(this.cookieService.get(`${AuthService.projectKey}-AUTH-TK`)));
    if (sessionToken) {
      return true;
    } else {
      return false;
    }
  }
  getUserRoleNumber() {
    const getUser = atob(this.cookieService.get(`${AuthService.projectKey}-AUTH-U`));
    if (getUser) {
      const user = JSON.parse(getUser);
      if (user) {
        return user?.roleKey;
      } else {
        return null;
      }
    }
  }

  getUserDetails() {
    const getUser = atob(this.cookieService.get(`${AuthService.projectKey}-AUTH-U`));
    if (getUser) {
      const user = JSON.parse(getUser);
      if (user) {
        return user;
      } else {
        return null;
      }
    }
  }
  userRoles(value: string[]): boolean {
    if (!value) {
      return false;
    }
    const menuRoles = value;
    const role = JSON.parse(sessionStorage.getItem(`${AuthService.projectKey}-AUTH-R`));
    if (!role) {
      return false;
    }
    return menuRoles.includes(role);
  }
  getUserRoles(): string[] {
    const data = atob(this.cookieService.get(`${AuthService.projectKey}-AUTH-R`));
    if (data) {
      /*  const role: string[] = JSON.parse(this.cookieService.get('ALTX-SESSION-AUTH-R')); */
      const role: string[] = JSON.parse(data);
      if (!role) {
        return [];
      }
      return role;
    }
    return [];
  }
  isAuthorized(allowedRoles: string[]): boolean {
    // check if the list of allowed roles is empty, if empty, authorize the user to access the page
    if (allowedRoles == null || allowedRoles.length === 0) {
      return true;
    }
    // get token from local storage or state management
    const token = localStorage.getItem(`${AuthService.projectKey}-AUTH-TK`);

    // decode token to read the payload details
    const decodeToken = this.jwtHelper.decodeToken(token);

    // check if it was decoded successfully, if not the token is not valid, deny access
    // const role = JSON.parse(localStorage.getItem('access_altx_role'));
    const roleCheck = atob(this.cookieService.get(`${AuthService.projectKey}-AUTH-R`));
    if (!roleCheck) {
      return false;
    }
    const role = JSON.parse(roleCheck);
    return role.some((role: string) => allowedRoles.includes(role));
    // return true;
  }

  logout() {
    // dev environment setup
    if (environment.ENVIRONMENT_MODE === ENVIRONMENT_MODES.DEVELOPMENT || environment.ENVIRONMENT_MODE === ENVIRONMENT_MODES.UAT) {
      this.cookieService.deleteAll('/', '.dev.com');
      localStorage.clear();
      this.router.navigate(['/pages/login']);
      // localhost setup
    } else if (environment.ENVIRONMENT_MODE === ENVIRONMENT_MODES.LOCALHOST) {
      this.cookieService.deleteAll('/', 'localhost');
      localStorage.clear();
      this.router.navigate(['/pages/login']);
    }
    //window.location.href = `${environment.RFQREDIRECTOFFLINE}redirect/logout_call`;
    // this.cookieService.deleteAll('/','manyrx.com');
    /*    this.obtainToken(TravtronicsTokenConfig)
          .toPromise()
          .then((tokenResponse: any) => {
            // this.sessionStorage.setSession('SESSION-AUTH-TK', tokenResponse.access_token);
            this.setSessionCookie(tokenResponse.access_token);
            this.router.navigate(['/']);
          })
          .catch((error) => {
            //console.log(error);
            this.router.navigate(['/']);
          }); */
    //this.cookieService.deleteAll('/');
    //this.getToken();
  }

  /**
   *
   *
   * @param {string[]} keys
   * @memberof AuthService
   */
  public savePageKeys(keys: string[]): void {
    if (keys) {
      window.localStorage.setItem(PAGE_PERMISSION_KEY, this.EncrDecr.encryptUsingAES256(keys));
    }
  }
  /**
   *
   *
   * @return {*}  {(string[] | null)}
   * @memberof AuthService
   */
  public getPageKeys(): string[] | null {
    if(window.localStorage.getItem(PAGE_PERMISSION_KEY)){
      const decryptData = this.EncrDecr.decryptUsingAES256(window.localStorage.getItem(PAGE_PERMISSION_KEY));
      const keys = JSON.parse(decryptData);
      if (keys) return keys;
    }else{
      return [];
    }


  }

  /**
   * method to set menu
   *
   * @param {RouteInfo[]} menu
   * @memberof AuthService
   */
  public setMenu(menu: RouteInfo[]): void {
    if (menu) {
      localStorage.setItem(MENU_DATA, this.EncrDecr.encryptUsingAES256(menu));
    }
  }

  /**
   *method get menu
   *
   * @return {*}  {RouteInfo[]}
   * @memberof AuthService
   */
  public getMenu(): RouteInfo[] {
    if(localStorage.getItem(MENU_DATA)){
      const DECRYPT_DATA = this.EncrDecr.decryptUsingAES256(localStorage.getItem(MENU_DATA));
      const MENU = JSON.parse(DECRYPT_DATA);
      if (MENU) {
        return MENU;
      }
    }else{
      return [];
    }


  }

/**
 *
 *
 * @param {number} customerType
 * @memberof AuthService
 */
public setCustomerType(customerType:CustomerDetails): void {
    if (customerType) {
      localStorage.removeItem(CUSTOMER_TYPE_DATA);
      localStorage.setItem(CUSTOMER_TYPE_DATA, this.EncrDecr.encryptUsingAES256(customerType));
    }
  }

/**
 *
 *
 * @return {*}  {CustomerDetails}
 * @memberof AuthService
 */
public getCustomerType():CustomerDetails {
  if(localStorage.getItem(CUSTOMER_TYPE_DATA)){
    const DECRYPT_DATA = this.EncrDecr.decryptUsingAES256(localStorage.getItem(CUSTOMER_TYPE_DATA));
    const customerDetails = JSON.parse(DECRYPT_DATA);
    if (customerDetails) {
      return customerDetails;
    }
  }else{
    return null;
  }

  }

/**
 *
 *
 * @param {RequestDetails} srRequest
 * @memberof AuthService
 */
public setRequestDetails(srRequest:RequestDetails): void {
  if (srRequest) {
    localStorage.removeItem(REQUEST_DATA);
    localStorage.setItem(REQUEST_DATA, this.EncrDecr.encryptUsingAES256(srRequest));
  }
}

/**
 *
 *
 * @return {*}  {RequestDetails}
 * @memberof AuthService
 */
public getRequestDetails():RequestDetails {
  if(localStorage.getItem(REQUEST_DATA)){
    const DECRYPT_DATA = this.EncrDecr.decryptUsingAES256(localStorage.getItem(REQUEST_DATA));
    const srDetails = JSON.parse(DECRYPT_DATA);
    if (srDetails) {
      return srDetails;
    }
  }else{
    return null;
  }

  }


  errorHandler(error) {
    let errorMessage = '';
    let errorRes = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
      errorRes = error.error.message;
    } else {
      // console.log('sdfg', error.error.message);
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      //  console.log('error message =====', errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`);
      //  errorRes = `Message: ${error.error.message}\nError Code: ${error.status}`;
      errorRes = `${error.error.message} `;
    }
    //  return throwError(errorMessage);
    return throwError(errorRes);
  }
}
