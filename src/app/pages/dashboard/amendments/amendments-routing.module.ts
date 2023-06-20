import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FlightComponent } from './request/flight/flight.component';
import { HotelComponent } from './request/hotel/hotel.component';

const routes: Routes = [
  {
    path:'request/flight',
    component: FlightComponent,
    data: {
      title: 'Amendments Request Flight',
       },
  },
  {
    path:'request/hotel',
    component: HotelComponent,
    data: {
      title: 'Amendments Request Hotel',
       },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AmendmentsRoutingModule { }
