import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuoteRoutingModule } from './quote-routing.module';
import { OpenQuotesComponent } from './components/open-quotes/open-quotes.component';
import { SubmittedQuotesComponent } from './components/submitted-quotes/submitted-quotes.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'app/shared/shared.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ApprovedQuotesComponent } from './components/approved-quotes/approved-quotes.component';
import { MptbComponent } from './components/mptb/mptb.component';
import { AncillaryQuoteComponent } from './components/ancillary-quote/ancillary-quote.component';




@NgModule({
  declarations: [
    OpenQuotesComponent,
     SubmittedQuotesComponent,
     ApprovedQuotesComponent,
     MptbComponent,
     AncillaryQuoteComponent,
    ],
  imports: [
    CommonModule,
    QuoteRoutingModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    NgbModule,
    SharedModule,
    NgSelectModule,
    Ng2SearchPipeModule,
    NgxDatatableModule

  ]
})
export class QuoteModule { }
