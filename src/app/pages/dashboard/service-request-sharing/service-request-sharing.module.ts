import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceRequestSupportComponent } from './components/service-request-support/service-request-support.component';
import { ServiceRequestDocsComponent } from './components/service-request-docs/service-request-docs.component';
import { ServiceRequestSupportModalComponent } from './components/service-request-support/service-request-support-modal/service-request-support-modal.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ServiceRequestSupportFaqComponent } from './components/service-request-support/service-request-support-faq/service-request-support-faq.component';
import { ServiceRequestSupportProcessComponent } from './components/service-request-support/service-request-support-process/service-request-support-process.component';

import { ServiceRequestSupportProcessTreeComponent } from './components/service-request-support/service-request-support-process/service-request-support-process-tree/service-request-support-process-tree.component';
import { FormsModule } from '@angular/forms';
import { ServiceRequestSupportPricingComponent } from './components/service-request-support/service-request-support-pricing/service-request-support-pricing.component';
import { ServiceRequestSupportAttachmentsComponent } from './components/service-request-support/service-request-support-attachments/service-request-support-attachments.component';
import { ServiceRequestSupportDocumentsComponent } from './components/service-request-support/service-request-support-documents/service-request-support-documents.component';

@NgModule({
  declarations: [
    ServiceRequestSupportComponent,
    ServiceRequestDocsComponent,
    ServiceRequestSupportModalComponent,
    ServiceRequestSupportFaqComponent,
    ServiceRequestSupportProcessComponent,
    ServiceRequestSupportProcessTreeComponent,
    ServiceRequestSupportPricingComponent,
    ServiceRequestSupportAttachmentsComponent,
    ServiceRequestSupportDocumentsComponent,
  ],
  exports: [ServiceRequestSupportComponent],
  imports: [CommonModule, NgbModule, FormsModule],
})
export class ServiceRequestSharingModule {}
