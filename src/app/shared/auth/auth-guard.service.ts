
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateChild } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { RolePermissionsService } from '../services/role-permissions.service';
@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private premissionsServices: RolePermissionsService,
    private authService: AuthService,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.secure(next,state);
  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.secure(next,state);
  }

  private async secure(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const PAGE_KEY = next.data.pageKey;
    const IS_LOGGED_IN = this.authService.isUserLoggedIn();

    if (!IS_LOGGED_IN) {
      this.authService.logout();
      return IS_LOGGED_IN;
    } else {
      const USER_ROLE_NUMBER = this.authService.getUserRoleNumber();
      if (!PAGE_KEY || !USER_ROLE_NUMBER) {
        this.router.navigate(['/pages/unauthorized']);
        return false;
      }

      try {
        const response: string[] = await this.premissionsServices.getPagePermissions(PAGE_KEY.pageId, USER_ROLE_NUMBER);
        if (response.length > 0) {
          if (response.includes(PAGE_KEY.key)) {
            this.authService.savePageKeys(response);
            return true;
          } else {
            this.router.navigate(['/pages/unauthorized']);
            return false;
          }
        } else {
          this.router.navigate(['/pages/unauthorized']);
          return false;
        }
      } catch (error) {
        this.router.navigate(['/pages/unauthorized']);
        return false;
      }
    }
  }

}
