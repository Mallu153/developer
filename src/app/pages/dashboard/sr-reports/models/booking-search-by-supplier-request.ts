export interface bookingReportBySupplier {
  product_id?: string[];
  booking_id?: string[];
  passenger_id?: string[];

  passenger_type?: string[];
  passenger_name?: string;
  passenger_mobile?: string;
  passenger_email?: string;
  supplier_reference?: string[];
  supplier_reference_from_date?: Date;
  supplier_reference_to_date?: Date;
  booking_reference_no?: string[];
  service_request?: string[];
  service_request_line?: string[];

  booking_supplier_id?: string[];
  booking_customer_id?: string[];

  booking_contact_id?: string[];

  booking_user_id?: string[];
  booking_created_from_date?: Date;
  booking_created_to_date?: Date;

  limitstart?: number;
  limitlength?:number;
}




  export interface BookingResponseData {
      product_name: string;
      product_id: string;
      booking_channel: string;
      booking_id: string;
      passenger_id: string;
      price_id: string;
      passenger_type: string;
      passenger_name: string;
      passenger_dob: string;
      passenger_mobile: string;
      passenger_email: string;
      sub_reference_for: string;
      sub_reference_for_1: string;
      sub_reference_for_2: string;
      supplier_reference: string;
      supplier_reference_date: string;
      booking_reference_no: string;
      service_request: string;
      service_request_line: string;
      booking_iata_id: string;
      booking_office_id: string;
      price_iata_id: string;
      price_office_id: string;
      booking_supplier_name: string;
      booking_supplier_id: string;
      booking_customer_name: string;
      booking_customer_id: string;
      price_supplier_name: string;
      price_supplier_id: string;
      price_customer_name: string;
      price_customer_id: string;
      booking_contact_id: string;
      booking_contact_name: string;
      booking_contact_mobile: string;
      booking_contact_email: string;
      supplier_sub_reference: string;
      supplier_sub_reference_parent: string;
      supplier_sub_reference_booklets: string;
      supplier_sub_reference_date: string;
      supplier_sub_reference_date_time: string;
      supplier_sub_reference_type: string;
      supplier_sub_reference_no: string;
      micro_account_id: string;
      currency: string;
      base_fare: string;
      tax: string;
      supplier_total: string;
      m1: string;
      m2: string;
      d1: string;
      d2: string;
      customer_total: string;
      booking_user_name: string;
      booking_user_id: string;
      booking_created_date: string;
      sub_reference_user_name: string;
      sub_reference_user_id: string;
      liability_user_name: string;
      liability_user_id: string;
      booking_location: string;
      booking_location_id: string;
      booking_costcenter: string;
      booking_costcenter_id: string;
      booking_business_unit: string;
      booking_business_unit_id: string;
      sub_reference_location: string;
      sub_reference_location_id: string;
      sub_reference_costcenter: string;
      sub_reference_costcenter_id: string;
      sub_reference_business_unit: string;
      sub_reference_business_unit_id: string;
      liability_location: string;
      liability_location_id: string;
      liability_costcenter: string;
      liability_costcenter_id: string;
      liability_business_unit: string;
      liability_business_unit_id: string;
  }



