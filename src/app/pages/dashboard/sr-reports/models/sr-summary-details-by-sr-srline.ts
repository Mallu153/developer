export interface SrSummaryDetailsBySrAndSrLine {
  status: boolean;
  message: string;
  reference_data: ReferenceDatum[];
  sub_reference_data: SubReferenceDatum[];
  purchase_order_data: any[];
  receipt_data: ReceiptDatum[];
  payment_data: any[];
  invoice_data: any[];
  quote_data: any[];
}

export interface ReceiptDatum {
  receipt_id: string;
  receipt_number: string;
  receipt_date: Date;
  refrence_value: string;
  receipt_applied_amount: string;
  receipt_source: string;
}

export interface ReferenceDatum {
  booking_id: string;
  service_request: string;
  service_request_line: string;
  booking_channel: string;
  booking_reference: string;
  supplier_reference: string;
  supplier_reference_date: Date;
}

export interface SubReferenceDatum {
  booking_id: string;
  service_request: string;
  service_request_line: string;
  booking_channel: string;
  booking_reference: string;
  supplier_reference: string;
  supplier_reference_date: Date;
  price_id: string;
  supplier_sub_reference: string;
  supplier_sub_reference_date: Date;
}
