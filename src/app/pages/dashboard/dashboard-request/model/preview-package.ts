export interface PreviewPackage {
  packageHeader: PackageHeader;
  packageLines: PackageLine[];
  packagePaxDetails:any[] | null;
}

export interface PackageHeader {
  totalNoOfDays: number;
  totalNoOfFlights: number;
  totalNoOfHotels: number;
  totalNoOfAttractions: number;
  totalNoOfAncillaries: number;
}

export interface PackageLine {
  date: Date;
  flight: Flight[];
  hotel: Hotel[];
  attraction: Attraction[];
  ancillary: Ancillary[];
}

export interface Ancillary {
  addOnId: number;
  addOnName: any;
  addOnCode: any;
  addOnDescription: any;
  addOnType: any;
  remarks: null | string;
  extraCost: boolean;
  paxCount: number;
  paxDetails: PaxDetail[];
  date?: Date;
  daysList?: Date[];
}

export interface PaxDetail {
  paxNo: number;
  paxType: any;
  paxRefence: number;
  selectedAllGroup: any;
}

export interface Attraction {
  attractionName: string;
  attractionID: number;
  city: string;
  country: string;
  location: string;
  paxCount: number | null;
  date: Date;
  paxDetails: PaxDetail[] | null;
}

export interface Flight {
  lineId: number;
  segmentBoardPoint: string;
  segmentBoardCityOrAirport: string;
  segmentDepartDate: Date;
  segmentDepartTime: null;
  segmentDepartTerminal: number;
  segmentOffPoint: string;
  segmentArrivalCityOrAirport: string;
  segmentArrivalDate: null;
  segmentArrivalTime: null;
  segmentArrivalTerminal: null;
  segmentAirlineOperating: null;
  segmentAirlineMarketing: null;
  segmentAirlineNo: null;
  segmentClassDesignator: string;
  segmentRbdCode: string;
  segmentNumOfStops: null;
  adtCount: number;
  chdCount: number;
  infCount: number;
  paxCount: null;
  addOns: any[];
  ancillaries: Ancillary[];
  paxInfo: any[] | null;
}

export interface Hotel {
  lineId: number;
  hotelName: null;
  hotelCode: null;
  roomNumber: string;
  roomName: string;
  roomType: null;
  hotelCountryCode: string;
  hotelCountryName: string;
  hotelCityCode: null;
  hotelCityName: string;
  hotelStar: null;
  hotelRating: string;
  hotelAddress: string;
  hotelDescription: null;
  hotelPhone: null;
  checkInDate: Date;
  checkOutDate: Date;
  budgetFrom: null;
  budgetTo: null;
  teamLeader: string;
  roomsCount: any;
  noOfDays: number;
  adtCount: number;
  chdCount: number;
  infCount: number;
  paxCount: null;
  roomAdtCount: number;
  roomChdCount: number;
  roomInfCount: number;
  roomChildAges: null;
  roomInfantAges: string;
  roomsInfo: RoomsInfo[];
  addOns: Ancillary[];
  ancillaries: Ancillary[];
  paxInfo: any[] | null;
  roomPaxInfo: any[] | null;
}

export interface RoomsInfo {
  roomNumber: number;
  roomName: string;
  roomType: string;
  roomAdultCount: number;
  roomChildCount: number;
  roomInfantCount: number;
  roomChildAges: null;
  roomInfantAges: string;
}
