export class PasssengerPost {
  passengers: PassengerEntity[];
  constructor() {
    this.passengers = [];
  }
}
export class PassengerEntity {
  namechange: any;
  dates: PassengerDates[];
  constructor() {
    this.dates = [];
    this.namechange = null;
  }
}
export class PassengerDates {
  depart_date: Date;
  last_leg: boolean;
  passenger_number: string;
  passenger_type: string;
  constructor() {
    this.depart_date = this.last_leg = this.passenger_number = this.passenger_type = null;
  }
}
