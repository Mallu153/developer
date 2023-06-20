export class SrSegmentHeader {
  serviceRequestLine: ServiceRequestLine;
  serviceRequestSegment: ServiceRequestSegment[];
}
export class ServiceRequestSegment {
  requestSegmentId: number;
  fromCode: string;
  toCode: string;
  className: string;
  flexClassName: string[];
  flexFromCode: string[];
  flexToCode: string[];
  rbd: string;
  airlineCode: string;
  flexAirLineCode: string[];
  depatureDate: string;
  flexDepature: FlexDepature[];
  flexReturn: FlexReturn[];
  returnDate: string;
  validateCarrier: string;
  budgetFrom: number;
  budgetTo: number;
  transitPointCode: string[];
  excludePointCode: string[];
  createdBy: number;
  createdDate: string;
  requestID: number;
}
export class ServiceRequestLine {
  requestId: number;
  tripTypeId: number;
  noofADT: number;
  noofCHD: number;
  noofINF: number;
  typeOfFlight: string;
  connectingDetails: string;
  flexStops: string[];
  passengerTypeId: number;
  createdBy: number;
  createdDate: string;
  expandableParametersCode: number[];
  dealCode: Deals[];
}
export class Deals {
  dealCode: string;
  airlineCode: string;
}
export class FlexDepature {
  flexDepatureDate: string;
  flexDepatureTime: string;
}
export class FlexReturn {
  flexReturnDate: string;
  flexReturnTime: string;
}
