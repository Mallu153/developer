export interface AmendmentsFlight {
  BookingData: BookingData;
  PriceData: PriceData[];
  PassengersData: PassengersData[];
  RefundData: any[];
}
export interface BookingData {
  BookingID: number;
  ProductId: number;
  BookingReferenceNo: string;
  BookingStatus: number;
  BookingType: string;
  BookingCurrency: string;
  RfqId: null;
  ServiceRequestId: number;
  ServiceRequestLineId: number;
  RequestData: null;
  SegmentData: null;
  QuoteId: number;
  IATAId: number;
  OfficeId: string;
  SupplierReferenceNo: string;
  SupplieCode: string;
  SupplierSiteCode: null;
  SupplierCompany: string;
  SupplierCostCenter: string;
  SupplierLocation: string;
  CutomerCode: string;
  CutomerSiteCode: string;
  CutomerCompany: string;
  CutomerCostCenter: string;
  CutomerLocation: string;
  UserID: number;
  UserRole: number;
  UserCompany: string;
  UserCostCenter: string;
  UserLocation: string;
  ContactId: number;
  ContactFirstName: string;
  ContactMiddleName: string;
  ContactLastName: string;
  ContactMobile: string;
  ContactEmail: string;
  ContactAddress: string;
  Imported: boolean;
  ImportedReason: null;
  Copied: boolean;
  ParentId: number;
  CopiedReason: null;
  AddedBy: number;
  AddedDate: Date;
  AddedDevice: string;
  AddedIP: string;
  UpdatedBy: null;
  UpdatedDate: null;
  UpdatedDevice: null;
  UpdatedIP: null;
  SupplierReferenceDate: Date;
  BookingChannel: null;
  SupplierName: string;
  CustomerName: string;
  AgentName: string;
  AgentSalutation: string;
}

export interface PassengersData {
  PassengerID: number;
  BookingID: number;
  CustomerTravelUserId: number;
  PAXType: string;
  Title: string;
  FirstName: string;
  MiddleName: string;
  LastSurname: string;
  DOB: null;
  Age: string;
  Gender: string;
  Mobile: null;
  Email: null;
  Country: null;
  Nationality: null;
  PassportNo: null;
  PassportIssueDate: null;
  PassportExpiryDate: null;
  PassportIssueCountry: null;
  SupplierReferenceNo: null;
  SupplierPAXNo: number;
  PassengerRelatedTo: number;
  AddedBy: number;
  AddedDate: Date;
  AddedDevice: string;
  AddedIP: string;
  UpdatedBy: number;
  UpdatedDate: Date;
  UpdatedDevice: string;
  UpdatedIP: string;
  CountryName: null;
  PassportCountryName: null;
  NationalityName: null;
}

export interface PriceData {
  ID: number;
  BookingID: number;
  PassengerID: number;
  SupplierReferenceNo: string;
  SupplierReferenceStatus: boolean;
  SupplierPAXNo: number;
  SupplierSubReferenceType: string;
  SupplierSubReferenceNo: number;
  SupplierSubReferenceStatus: string;
  PAXType: string;
  SegmentNumbers: string;
  SegmentData: SegmentData[];
  BaseFare: number;
  BaseCurrency: string;
  EquivalentFare: null;
  EquivalentCurency: null;
  Tax: number;
  TaxData: null;
  SupplierTotal: number;
  CommissionPercantage: null;
  CommissionAmount: null;
  M1: number;
  M1TemplateId: number;
  M1TemplateData: null;
  M2: number;
  D1: number;
  D1TemplateData: null;
  D2: number;
  TotalAmount: number;
  PaidAmount: null;
  Zvalue: null;
  IATAId: null;
  OfficeId: null;
  PriceType: null;
  TicketPAXReferenceID: string;
  TicketNumber: string;
  TicketParentNumber: null;
  NumberOfBooklets: number;
  TicketExtension: null;
  TicketType: null;
  TicketStatus: string;
  Refundable: null;
  EMDType: string;
  FZ: null;
  FY: null;
  FV: string;
  FT: string;
  FS: null;
  FP: string;
  FO: null;
  FN: null;
  FM: string;
  FI: null;
  FH: null;
  FG: null;
  FE: string;
  FD: null;
  FB: null;
  FA: null;
  TicketingCarrier: string;
  TicketedDate: Date;
  TicketedDateTime: Date;
  TicketedBy: number;
  LiabilityOwner: number;
  Imported: null;
  ImportedReason: null;
  LPOGenerated: null;
  LPOGeneratedDate: null;
  LPONumber: null;
  InvoiceGenerated: null;
  InvoiceGenerateddate: null;
  Remarks: null;
  Copied: null;
  ParentId: null;
  CopiedReason: null;
  SupplieCode: string;
  SupplierSiteCode: null;
  SupplierCompany: string;
  SupplierCostCenter: string;
  SupplierLocation: string;
  CutomerCode: string;
  CutomerSiteCode: null;
  CutomerCompany: string;
  CutomerCostCenter: string;
  CutomerLocation: string;
  UserID: number;
  UserRole: number;
  UserCompany: string;
  UserCostCenter: string;
  UserLocation: string;
  AddedBy: number;
  AddedDate: Date;
  AddedDevice: string;
  AddedIP: string;
  UpdatedBy: number;
  UpdatedDate: Date;
  UpdatedDevice: string;
  UpdatedIP: string;
  WareHouse: boolean;
  SupplierReceiptGenerated: null;
  SupplierReceiptGeneratedDate: null;
  SupplierReceiptGeneratedAmount: null;
  SupplierInvoiceGenerated: null;
  SupplierInvoiceGeneratedDate: null;
  SupplierInvoiceGeneratedAmount: null;
  M2ReasonData: null;
  D2ReasonData: null;
  PAX_Type: string;
  PAXTitle: string;
  PAXFirstName: string;
  PAXMiddleName: string;
  PAXLastSurname: string;
  SupplierName: string;
  CustomerName: string;
  TicketUserSalutation: string;
  TicketUserName: string;
  LiabilityUserSalutation: string;
  LiabilityUserName: string;
  AgentSalutation: string;
  AgentName: string;
}

export interface SegmentData {
  id: string;
  bag: string;
  rbd: null;
  city: null;
  refNo: null;
  segTo: string;
  address: null;
  airLine: string;
  arrDate: string;
  arrTime: string;
  depDate: string;
  depTime: string;
  segFrom: string;
  flightNo: string;
  headerId: string;
  fareRules: null;
  cabinClass: string;
  hotelAnxCode: null;
  hotelAnxName: null;
  roomOrServiceNo: null;
  operatingCarrier: null;
  roomOrServiceName: null;
  roomOrServiceType: null;
  internalCancellationPolicy: null;
  supplierCancellationPolicy: null;
}

export class FlightApiResponse {
  status: number;
  data: any[];
  message: string;
  errors?: any;
}

export interface ReissueRequest {
  amendmentCreatedBy: number;
  amendmentCreatedDate: string;
  amendmentCreatedDevice: string;
  amendmentCreatedIp: string;
  amendmentDetails: string;
  amendmentExtraCost?: number;
  amendmentId: number;
  amendmentName: string;
  amendmentPriority: number;
  amendmentRemarks: string;
  amendmentSeverity: number;
  amendmentStatus: number;
  amendmentUpdatedBy?: number;
  amendmentUpdatededDate?: string;
  amendmentUpdatededDevice?: string;
  amendmentUpdatededIp?: string;
  attr1?: string;
  attr10?: string;
  attr11?: string;
  attr12?: string;
  attr13?: string;
  attr14?: string;
  attr15?: string;
  attr2?: string;
  attr3?: string;
  attr4?: string;
  attr5?: string;
  attr6?: string;
  attr7?: string;
  attr8?: string;
  attr9?: string;
  bookingId: number;
  productId: number;
  serviceRequestId: number;
}

export class PNR {
  supplier_reference: string;
}

export class PNRAPIRESPONSE {
  status: boolean;
  pnr_data_information: any;
}

export class CHECK_LIST_APIRESPONSE {
  status: boolean;
  check_list: any[];
}
export class CheckListData {
  amendment_request_id: number;
  service_request_id: number;
}

export interface CreateCheckList {
  check_list: CheckList[];
  amendment_request_id: number;
  service_request_id: number;
  checkListCreatedBy: number;
  checkListCreatedDate: string;
  checkListCreatedDevice: string;
  checkListCreatedIp: null;
}

export interface CheckList {
  request_for: string;
  request_for_text: string;
  from: string;
  to: string;
  passenger_type: string;
  passenger_number: string;
  segment_reference_number: string;
  segment_number: number;
  passenger_name: string;
  check_flag: boolean;
}
export interface CreateCheckListResponse {
  status: boolean;
  message: string;
  error: any[];
  reference: string;
}
export class HOTEL_AMENDMENTS_RESPONSE {
  status: boolean;
  booking_data_array: any;
}

export class HotelBooking {
  booking_reference: string;
}

export class HotelDetailsResponse {
  status: boolean;
  message: string;
  count: number;
  data: any[];
}

export class HotelDeatils {
  query?: string;
  destination_code?: string;
  code?: number;
}

export interface HotelName {
  code: number;
  name: City;
  destinationCode: string;
  city: City;
  hotelName: string;
  cityName: string;
}

export interface City {
  content: string;
}
