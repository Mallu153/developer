import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ErrorPageComponent } from '../auth/error/error-page.component';
import { ForgotPasswordPageComponent } from '../auth/forgot-password/forgot-password-page.component';
import { LoginPageComponent } from '../auth/login/login-page.component';
import { RegisterPageComponent } from '../auth/register/register-page.component';
import { UnauthorizedComponent } from '../auth/unauthorized/unauthorized.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'error',
        component: ErrorPageComponent,
        data: {
          title: 'Error Page',
        },
      },
      {
        path: 'login',
        component: LoginPageComponent,
        data: {
          title: 'Login Page',
        },
      },
      {
        path: 'register',
        component: RegisterPageComponent,
        data: {
          title: 'Register Page',
        },
      },
      {
        path: 'forgotpassword',
        component: ForgotPasswordPageComponent,
        data: {
          title: 'Forgot Password Page',
        },
      },
      {
        path: 'unauthorized',
        component: UnauthorizedComponent,
        data: {
          title: 'Un Authorized Page',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentPagesRoutingModule { }
