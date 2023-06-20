export interface FlightRfq {
  rfqLine: RfqLine;
  rfqSegments: RfqSegment[];
  rfqSupplierRelation: RfqSupplierRelation[];
}

export interface RfqLine {
  addons: Addon[];
  airlineCode: string;
  allianceCode: string;
  connectingDetails: string;
  createdBy: number;
  createdDate: Date;
  dealCode: Addon[];
  expandableParametersCode: string[];
  flexStops: string[];
  noofADT: number;
  noofCHD: number;
  noofINF: number;
  passengerTypeId: number;
  requestId: number;
  requestLineId: number;
  rfqId: number;
  rfqNo: number;
  rfqUuid: string;
  statusId: number;
  stopOverCode: string;
  transitionId: number;
  tripTypeId: number;
  typeOfFlight: string;
  updatedBy: number;
  updatedDate: Date;
}

export interface Addon {
  additionalProp1: AdditionalProp;
  additionalProp2: AdditionalProp;
  additionalProp3: AdditionalProp;
}

export interface AdditionalProp {}

export interface RfqSegment {
  airlineCode: string;
  arrivalTime: string;
  budgetFrom: number;
  budgetTo: number;
  className: string;
  createdBy: number;
  createdDate: Date;
  depatureDate: Date;
  depatureTime: string;
  excludePointCode: string[];
  flexAirLineCode: string[];
  flexClassName: string[];
  flexDepature: Addon[];
  flexFromCode: string[];
  flexReturn: Addon[];
  flexStops: string[];
  flexToCode: string[];
  flightDirection: string;
  fromAirportOrCityName: string;
  fromCode: string;
  fromCountryName: string;
  nearestAirportArrivalCode: string[];
  nearestAirportDepartureCode: string[];
  rbd: string;
  requestID: number;
  requestSegmentId: number;
  requestlineID: number;
  returnDate: Date;
  rfqId: number;
  rfqUuid: string;
  toAirportOrCityName: string;
  toCode: string;
  toCountryName: string;
  transitPointCode: string[];
  updatedBy: number;
  updatedDate: Date;
  validateCarrier: boolean;
}

export interface RfqSupplierRelation {
  createdBy: number;
  requestId: number;
  requestLineId: number;
  rfqId: number;
  sno: number;
  status: number;
  supplierContactId: number;
  supplierId: number;
  updatedBy: number;
}
export interface FlightRfqSupplierContact {
  supplierContact:Contact[];
}
export interface Contact {
  contactId:number,
  contactName:string,
  contactNumber:number,
  contactEmail:string
}
