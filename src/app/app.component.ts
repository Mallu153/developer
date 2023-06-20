import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  private websiteName = environment.WEB_SITE_NAME;
  constructor(
    private router: Router,
    private titleService: Title
    ) {}



   /**
   * collect that title data properties from all child routes
   * @param {*} state
   * @param {*} parent
   * @return {*}
   * @memberof AppComponent
   */
   getTitle(state: any, parent: any) {
    let data = [];
    if (parent && parent.snapshot.data && parent.snapshot.data.title) {

      data.push(parent.snapshot.data.title);
    }
    if (state && parent) {
      data.push(... this.getTitle(state, state.firstChild(parent)));
    }
    return data;
  }

  ngOnInit() {
   /*  this.subscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => window.scrollTo(0, 0)); */

      this.subscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        let title = this.getTitle(this.router.routerState, this.router.routerState.root).join('-');
        if (title) this.titleService.setTitle(title + ' | ' + this.websiteName);
        window.scrollTo(0, 0)
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
