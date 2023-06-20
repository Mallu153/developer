import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmendmentsRoutingModule } from './amendments-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FlightComponent } from './request/flight/flight.component';
import { RequestDetailsComponent } from './request/request-details/request-details.component';
import { HotelComponent } from './request/hotel/hotel.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { GenerateCheckListComponent } from './request/generate-check-list/generate-check-list.component';

@NgModule({
  declarations: [
     FlightComponent,
     RequestDetailsComponent,
     HotelComponent,
     GenerateCheckListComponent
  ],
  imports: [
    CommonModule,
    AmendmentsRoutingModule,
    FormsModule,
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    NgbModule,
    NgSelectModule,
  ],
})
export class AmendmentsModule {}
