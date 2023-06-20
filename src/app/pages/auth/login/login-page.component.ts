import { forEach } from 'core-js/core/array';
import { Component, ViewChild, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/shared/auth/auth.service';
import { LoginResponse, TokenPayload, verifyToken } from 'app/shared/models/login-response';
import { NgxSpinnerService } from 'ngx-spinner';

import { Subject } from 'rxjs';
import jwt_decode from 'jwt-decode';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { MenuReponse } from 'app/shared/models/menu-response';
import { RouteInfo } from 'app/shared/components/vertical-menu/vertical-menu.metadata';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit, OnDestroy {
  loginFormSubmitted = false;
  isLoginFailed = false;
  loginForm: FormGroup;
  errorMessage: string;
  //window variables
  win: any;
  continue: string;
  ngDestroy$ = new Subject();

  public showPassword: boolean;
  public showPasswordOnPress: boolean;


  constructor(
    private router: Router,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.initializeLoginForm();
    this.getQueryParams();
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  getQueryParams() {
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      /* if (param && param.tt_session) {
        this.authService.logout();
      } */
      if (param && param.continue) {
        this.continue = param.continue;
      } else {
        this.onCheckCookieAvailable();
      }
    });
  }

  initializeLoginForm() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      //username: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      password: ['', [Validators.required]],
    });
  }
  get lf() {
    return this.loginForm.controls;
  }

  // On submit button click
  onSubmit() {
    this.loginFormSubmitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    this.spinner.show(undefined, {
      type: 'ball-triangle-path',
      size: 'medium',
      bdColor: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      fullScreen: true,
    });
    const dataToSend = {
      email: this.loginForm.value.username,
      password: this.loginForm.value.password,
    };
    //this.encryptUsingAES256();
    this.authService.signIn(dataToSend).subscribe(
      (res: LoginResponse) => {
        const result: LoginResponse = res;

        if (result) {
          localStorage.clear();
          // this.loginDetailsSendToPHP(result);
          this.isLoginFailed = false;
          this.loginDetailsSetup(result);
        } else {
          this.spinner.hide();
          // alert('something wrong');
          this.errorMessage = 'something went wrong, please contact support team';
          this.cdr.markForCheck();
        }
      },
      (err) => {
        this.spinner.hide();
        this.isLoginFailed = true;
        this.errorMessage = err;
        this.cdr.markForCheck();
      }
    );

    /*  this.authService
      .signinUser(this.loginForm.value.username, this.loginForm.value.password)
      .then((res) => {
        this.spinner.hide();
        this.router.navigate(['/dashboard/home']);
      })
      .catch((err) => {
        this.isLoginFailed = true;
        this.spinner.hide();
        console.log('error: ' + err);
      }); */
  }

  loginDetailsSetup(accessTokenData: LoginResponse) {
    const accessData = accessTokenData;


    if (
      !accessData.loginResponse &&
      !accessData.userId &&
      !accessData.costCenterId &&
      !accessData.locationId &&
      !accessData.orgId &&
      !accessData.userRoles &&
      accessData.userRoles.length === 0
    ) {
      // alert('Please contact support team');
      this.errorMessage = 'Please contact support team';
      return;
    }



    if(accessData?.menu?.group?.lines?.length > 0) {
      this.setMenu(accessData?.menu?.group?.lines);
    } else {
      console.log("No menu found");
    }

    const accessToken = JSON.parse(accessData.loginResponse);
    const { wtId, wtProfile } = jwt_decode(accessToken.access_token) as TokenPayload;


    const isSetCoockie = this.authService.setCookies(
      accessToken.access_token,
      accessData.userId,
      accessData.userRoles,
      accessData.fullName,
      accessData.costCenterId,
      accessData.locationId,
      accessData.orgId,

      accessData.ttUserId,
      wtId === undefined ? 0 : wtId,
      wtProfile === undefined ? null : wtProfile,
      accessToken.refresh_token,
      accessData.roleId,
      accessData.roleName,
      accessData.roleKey,
      accessData.bizId,
      accessData.bizName,
      accessData.contactId,
      accessData.contactName,
      accessData.url+'/'+accessData.pagePath

    );

    if (isSetCoockie) {
      //this.spinner.hide();
      if (this.continue) {

        window.location.href = this.continue;
      } else {
        if (!this.continue) {

          this.spinner.hide();

          //window.location.href= accessData.pagePath;
          window.location.href= accessData.url+'/'+accessData.pagePath;
          //this.router.navigate([`/${accessData.url+accessData.pagePath}`]);
          //this.router.navigate(['/dashboard/cash-management/cash-dashboard']);
        }
      }
      /* if (!this.continue) {
        this.spinner.hide();
        //this.router.navigate(['/dashboard/home']);
        this.router.navigate(['/dashboard/cash-management/cash-dashboard']);
      } */
      //this.router.navigate(['/dashboard/home']);
    } else {
      this.spinner.hide();
      this.errorMessage = 'something went wrong please try again';
    }
  }

  openNewTab = (id) => {
    this.win = window.open(
      `${environment.RFQREDIRECTOFFLINE}redirect/login_call/${id}`,
      'LoginWindow',
      'directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=400,height=350'
    );
    setTimeout(() => {
      this.closeTab();
      if (this.continue) {
        window.location.href = this.continue;
      }
    }, 3000);
  };

  closeTab = () => {
    this.win.close();
  };

  loginDetailsSendToPHP(apiResones) {
    const sendPayload: any = {
      collection: 'log_session_data',
      database: 'travel',
      data: apiResones,
    };
    this.authService.loginAfterCall(sendPayload).subscribe((res) => {
      if (res.status === true) {
        this.openNewTab(res?.id);
      }
    });
  }

  onCheckCookieAvailable() {
    const TOKEN = this.authService.getSessionCookie();
    const  JRT= this.authService.getJRTCookie();
    if (TOKEN&&JRT) {
      this.verifyToken(TOKEN);
    }else{
      this.router.navigate(['/pages/login']);
    }

  }


  verifyToken(token:string){
    this.authService.verifyToken(token).subscribe(
      (res: verifyToken) => {
        const result: verifyToken = res;


        if(result?.active==true){
          const routes=this.authService.getUserDetails();
          if (this.continue) {


            window.location.href = this.continue;
          } else {
            if (!this.continue&&routes?.pagePath) {

              window.location.href= routes?.pagePath;
            }
          }
        }else{
          this.router.navigate(['/pages/login']);
        }
      });
  }

  private setMenu(menuData: MenuReponse[]): void {
    let setMenu = [];
    menuData?.forEach((menu) => {
      const route: RouteInfo = {
          path:menu.externalLink===true?menu.path===null?'':menu.url+'/'+menu.path:menu.path===null?'':'/'+menu.path,
          title: menu.name,
          icon: menu.icon,
          class: menu?.group?.lines?.length > 0  ? 'has-sub': '',
          badge: menu.badage,
          badgeClass: menu.badageClass,
          isExternalLink: menu.externalLink,
          submenu:   menu?.group?.lines?.length>0?this.changeMenu(menu?.group?.lines):[],
      }
      setMenu.push(route);
    });


    this.authService.setMenu(setMenu);
  }

  private changeMenu(menuData: MenuReponse[]): RouteInfo[] {
    if(menuData?.length>0){
      return  menuData.map((menu) => {
        const route: RouteInfo = {
            path: menu.externalLink===true?menu.path===null?'':menu.url+'/'+menu.path:menu.path===null?'':'/'+menu.path,
            title: menu.name,
            icon: menu.icon,
            class: menu?.group?.lines?.length > 0    ? 'has-sub': '',
            badge: menu.badage,
            badgeClass: menu.badageClass,
            isExternalLink: menu.externalLink,
            submenu:  menu?.group?.lines?.length>0?this.changeMenu(menu?.group?.lines):[],
        }
        return route;
      });
    }

  }

}
