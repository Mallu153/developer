import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageNotFoundComponent } from './page-not-found.component';
import { pageNotFoundRouters } from './page-not-found.routers';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [PageNotFoundComponent],
  imports: [CommonModule, RouterModule.forChild(pageNotFoundRouters)],
  exports: [PageNotFoundComponent],
})
export class PageNotFoundModule {}
