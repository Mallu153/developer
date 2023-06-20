export interface RFQ {
  rfqLine: RfqLine;
  rfqSegments: RfqSegment[];
  rfqSupplierRelation: RfqSupplierRelation[];
}

export interface RfqLine {
  addons?: string[];
  airlineCode?: string;
  allianceCode?: string;
  connectingDetails: string;
  createdBy?: number;
  createdDate?: string;
  dealCode: string[];
  expandableParametersCode: string[];
  flexStops: string[];
  noofADT: number;
  noofCHD: number;
  noofINF: number;
  passengerTypeId: number;
  requestId: number;
  requestLineId: number;
  rfqId?: number;
  statusId?: number;
  stopOverCode?: string;
  tripTypeId: number;
  typeOfFlight: string;
  updatedBy?: number;
  updatedDate?: string;
}


export interface RfqSegment {
  airlineCode: string;
  arrivalTime: string;
  budgetFrom: number;
  budgetTo: number;
  className: string;
  createdBy: number;
  createdDate: string;
  depatureDate: string;
  depatureTime: string;
  excludePointCode: string[];
  flexAirLineCode: string[];
  flexClassName: string[];
  flexDepature: string[];
  flexFromCode: string[];
  flexReturn: string[];
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
  returnDate: string;
  rfqId: number;
  toAirportOrCityName: string;
  toCode: string;
  toCountryName: string;
  transitPointCode: string[];
  updatedBy?: number;
  updatedDate?: string;
  validateCarrier: boolean;
}

export interface RfqSupplierRelation {
  createdBy: number;
  createdDate: string;
  requestId: number;
  requestLineId: number;
  rfqId: number;
  sno: number;
  status: number;
  supplierId: number;
  updatedBy?: number;
  updatedDate?: string;
}

