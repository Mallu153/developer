export class RFQHotelLine {
  id?: number;
  lineLatitude: string;
  lineLongitude: string;
  lineCity: string;
  lineCountry: string;
  lineAdultCount: number;
  lineAddonsRequired: number;
  lineApis: string;
  lineCheckInDate: string;
  lineCheckOutDate: string;
  lineChildCount: number;
  lineCountryResidency: string;
  lineHotelName: string;
  lineInfantCount?: number;
  lineLocation: string;
  lineMarkUpType: string;
  lineMarkupAmount: string;
  lineMarkupPercentage: string;
  lineMealType: string;
  lineNationality: string;
  lineNoOfNights: number;
  linePropertyType: string;
  lineRadius?: string;
  lineRatings: number;
  lineRoomCount: number;
  lineSearchType?: string;
  lineSrId: number;
  lineTotalDays: number;
  lineCreatedBy?: number;
  lineCreatedDate?: string;
  lineCreatedDevice?: string;
  lineCreatedIp?: string;
  lineUpdatedBy?: number;
  lineUpdatedDate?: string;
  lineUpdatedDevice?: string;
  lineUpdatedIp?: string;
}


export class RFQRoom {
  id?: number;
  roomSrId: number;
  roomLineId?: number;
  roomAddonsRequired?: number;
  roomAdultCount: number;
  roomChildAges: string;
  roomChildCount: number;
  roomInfantAges?: string;
  roomInfantCount?: number;
  roomNumber: number;
  roomStatus: number;
  roomCreatedBy?: number;
  roomCreatedDate?: Date;
  roomCreatedDevice?: string;
  roomCreatedIp?: string;
  roomUpdatedBy?: number;
  roomUpdatedDate?: Date;
  roomUpdatedDevice?: string;
  roomUpdatedIp?: string;
  roomPassengersInfo?: RFQHotelPassengers[]
}
export class RFQHotel {
  srLine: RFQHotelLine;
  srRooms: RFQRoom[];
}


export class RFQHotelPassengers {
  id?: number;
  passengerAddonsRequired: number;
  passengerCountryResidency: number;
  passengerCoutry: number;
  passengerEmail: string;
  passengerFirstName: string;
  passengerLastName: string;
  passengerLineId: number;
  passengerMiddleName: string;
  passengerNationality: number;
  passengerPaxId: number;
  passengerPhone: string;
  passengerRoomId: number;
  passengerSrId: number;
  passengerStatus: number;
  passengerTitle: string;
  passengerType: number;
  passengerCreatedBy?: number;
  passengerCreatedDate?: string;
  passengerCreatedDevice?: string;
  passengerCreatedIp?: string;
  passengerUpdatedBy?: number;
  passengerUpdatedDate?: string;
  passengerUpdatedDevice?: string;
  passengerUpdatedIp?: string;
}
export class RFQAddons {
  id?: number;
  addonFor: string;
  addonSrId: number;
  addonLineId: number;
  addonRoomId: string;
  addonPassengerId: string;
  addonPassengers: string;
  addonWithBooking: number;
  addonCount: number;
  addonNights: string;
  addonRemarks: string;
  addonRequired: number;
  addonExtraCost: number;
  addonStatus: number;
  addonSubType: string;
  addonSubTypeId: number;
  addonTitle: string;
  addonType: string;
  addonTypeId: number;
  addonDescription?: string;
  addonCreatedBy?: number;
  addonCreatedDate?: Date;
  addonCreatedDevice?: string;
  addonCreatedIp?: string;
  addonUpdatedBy?: number;
  addonUpdatedDate?: Date;
  addonUpdatedDevice?: string;
  addonUpdatedIp?: string;
}
