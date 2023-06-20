import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ClickOutsideModule } from 'ng-click-outside';

import { AutocompleteModule } from './components/autocomplete/autocomplete.module';
import { PipeModule } from 'app/shared/pipes/pipe.module';

//COMPONENTS
import { FooterComponent } from './components/footer/footer.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HorizontalMenuComponent } from './components/horizontal-menu/horizontal-menu.component';
import { VerticalMenuComponent } from './components/vertical-menu/vertical-menu.component';
import { NotificationSidebarComponent } from './components/notification-sidebar/notification-sidebar.component';
import { MicroAccountViewComponent } from './components/micro-account-view/micro-account-view.component';
import { DashboardBtnsComponent } from './components/dashboard-btns/dashboard-btns.component';

//DIRECTIVES
import { ToggleFullscreenDirective } from './directives/toggle-fullscreen.directive';
import { SidebarLinkDirective } from './directives/sidebar-link.directive';
import { SidebarDropdownDirective } from './directives/sidebar-dropdown.directive';
import { SidebarAnchorToggleDirective } from './directives/sidebar-anchor-toggle.directive';
import { SidebarDirective } from './directives/sidebar.directive';
import { TopMenuDirective } from './directives/topmenu.directive';
import { TopMenuLinkDirective } from './directives/topmenu-link.directive';
import { TopMenuDropdownDirective } from './directives/topmenu-dropdown.directive';
import { TopMenuAnchorToggleDirective } from './directives/topmenu-anchor-toggle.directive';
import { SortDirective } from './directives/sort.directive';
import { ClickOutsideDirective } from './directives/clickoutside.directive';
import { CountUpDirective } from './directives/count-up.directive';
import { FlexpriceDirective } from './directives/flexprice.directive';
import { PasswordShowHideDirective } from './directives/password-show-hide.directive';
import { ButtonAccessDirective } from './directives/button-access.directive';





@NgModule({
  exports: [
    CommonModule,
    FooterComponent,
    NavbarComponent,
    VerticalMenuComponent,
    HorizontalMenuComponent,
    NotificationSidebarComponent,
    ToggleFullscreenDirective,
    SidebarDirective,
    TopMenuDirective,
    NgbModule,
    TranslateModule,
    SortDirective,
    ClickOutsideDirective,
    CountUpDirective,
    FlexpriceDirective,
    PasswordShowHideDirective,
    MicroAccountViewComponent,
    DashboardBtnsComponent,
    ButtonAccessDirective
  ],

  imports: [
    RouterModule,
    CommonModule,
    NgbModule,
    TranslateModule,
    FormsModule,
    OverlayModule,
    ReactiveFormsModule,
    PerfectScrollbarModule,
    ClickOutsideModule,
    AutocompleteModule,
    PipeModule,
  ],
  declarations: [
    FooterComponent,
    NavbarComponent,
    VerticalMenuComponent,
    HorizontalMenuComponent,
    NotificationSidebarComponent,
    ToggleFullscreenDirective,
    SidebarLinkDirective,
    SidebarDropdownDirective,
    SidebarAnchorToggleDirective,
    SidebarDirective,
    TopMenuLinkDirective,
    TopMenuDropdownDirective,
    TopMenuAnchorToggleDirective,
    TopMenuDirective,
    SortDirective,
    ClickOutsideDirective,
    CountUpDirective,
    FlexpriceDirective,
    PasswordShowHideDirective,
    MicroAccountViewComponent,
    ButtonAccessDirective,
    DashboardBtnsComponent,


  ],
})
export class SharedModule { }
