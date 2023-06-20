export interface Airline {
  id: number;
  name: string;
  code: string;
  shortCode2Digit: string;
  shortCode3Digit: string;
  createdDate: Date;
  airLineType: string;
  parentAirline: string;
}
