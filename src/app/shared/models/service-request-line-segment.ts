export interface ServiceRequestLineSegments {
  id?: number;
  fromCode: string;
  toCode: string;
  className: string;
  rbd: string;
  airlineCode: string;
  flightDirection?: string;
  returnDate?: Date;
  validateCarrier: boolean,
  budgetFrom: number,
  budgetTo: number,
  transitPointCode: string;
  excludePointCode: string;
  reatedBy: 1,
  createdDate: Date;
  flexData: any
}
export interface flexData {
  flexFromCode: string;
  flexToCode: string;
  flexClassName: string;
  flexairlineCode: string;
  flexDepature: string;
  flexReturn: string;
  FlexStops: string;
  budgetFrom: number;
  budgetTo: number;
}
