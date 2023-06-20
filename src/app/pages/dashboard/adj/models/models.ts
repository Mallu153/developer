export class Register {
  // tslint:disable-next-line: whitespace
  registerID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  password: string;
  DateofBirth: number;
  PhoneNumber: number;
  Address: string;
}

export class PNRResponse {
  count: number;
  data: PNRDetails[];
  logid: string;
  message: string;
  status: boolean;
}

export class PNRDetails {
  base_fare: string;
  booking_business_unit: string;
  booking_business_unit_id: string;
  booking_contact_email: string;
  booking_contact_id: string;
  booking_contact_mobile: string;
  booking_contact_name: string;
  booking_costcenter: string;
  booking_costcenter_id: string;
  booking_created_date: string;
  booking_customer_id: string;
  booking_customer_name: string;
  booking_iata_id: string;
  booking_id: string;
  booking_location: string;
  booking_location_id: string;
  booking_office_id: string;
  booking_reference_no: string;
  booking_supplier_id: string;
  booking_supplier_name: string;
  booking_user_id: string;
  booking_user_name: string;
  currency: string;
  customer_total: string;
  d1: string;
  d2: string;
  liability_business_unit: string;
  liability_business_unit_id: string;
  liability_costcenter: string;
  liability_costcenter_id: string;
  liability_location: string;
  liability_location_id: string;
  liability_user_id: string;
  liability_user_name: string;
  m1: string;
  m2: string;
  micro_account_id: string;
  passenger_dob: string;
  passenger_email: string;
  passenger_id: string;
  passenger_mobile: string;
  passenger_name: string;
  passenger_type: string;
  price_customer_id: string;
  price_customer_name: any;
  price_iata_id: any;
  price_id: string;
  price_office_id: string;
  price_supplier_id: string;
  price_supplier_name: string;
  product_id: string;
  product_name: string;
  service_request: string;
  service_request_line: string;
  sub_reference_business_unit: string;
  sub_reference_business_unit_id: string;
  sub_reference_costcenter: string;
  sub_reference_costcenter_id: string;
  sub_reference_for: string;
  sub_reference_for_1: string;
  sub_reference_for_2: string;
  sub_reference_location: string;
  sub_reference_location_id: string;
  sub_reference_user_id: string;
  sub_reference_user_name: string;
  supplier_reference: string;
  supplier_reference_date: string;
  supplier_sub_reference: string;
  supplier_sub_reference_booklets: string;
  supplier_sub_reference_date: string;
  supplier_sub_reference_date_time: string;
  supplier_sub_reference_no: string;
  supplier_sub_reference_parent: string;
  supplier_sub_reference_type: string;
  supplier_total: string;
  tax: string;
  ID: any;
  Total: any;
  Commission: any;
  TicketNumber: any;
}
export interface SearchPaxData {
  firstName: string;
  lastName: string;
  primaryPhoneNumber: number;
  primaryEmail: string;

}
export class Pax {
  id?: number;
  nationality?: number;
  dob?: Date;
  passport?: string;
  issuedCountry?: number;
  paxId: number;
  customerId: number;
  prefix: number;
  firstName: string;
  middleName: string;
  lastName: string;
  designationId: number;
  designationName?: string;
  roleId: number;
  primaryEmail: string;
  primaryCCP: number;
  primaryPhoneNumber: number;
  secondaryEmail: string;
  secondaryCCP: number;
  secondaryPhoneNumber: number;
  telephoneNumber: number;
  remarksAndNotes: string;
  startDate: Date;
  endDate: Date;
  status: number;
  createdBy?: number;
  updatedBy?: number;
  length?: number;
}
export class PaxSendPayLoad {
  paxModel: Pax;
}

