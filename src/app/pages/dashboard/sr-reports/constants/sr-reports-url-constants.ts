export const sr_reports ={
bookingReport:'reports/booking/get_report',
bookingReportBySupplier:'reports/booking/get_report_by_supplier_reference',
//Warehouse Booking Report Controller urls
getBookingReference:'/BookingReport/get-booking-reference?bookingReferenceNo=',
getMicroAccount:'/BookingReport/get-micro-account?microAccount=',
getServiceRequestLine:'/BookingReport/get-service-request-line?serviceRequestLine=',
getServiceRequest:'/BookingReport/get-service-requests?serviceRequest=',
getSubReferenceType:'/BookingReport/get-sub-reference-type',
getSupplierReference:'/BookingReport/get-supplier-reference?suplierReference=',
getSupplierSubReference:'/BookingReport/get-supplier-sub-reference?supplierSubReference=',
getSupplierSubReferenceParent:'/BookingReport/get-supplier-sub-reference-parent?supplierSubReferenceParent=',
getProduct:'gen/master_products/name/',
getPassengerType:'gds/master_pax_type/name/',
IataIDController:'gds/iata-ids/name/',
officeID:"gds/office-ids/name/",
supplier:'customer/supplier/businessName?businessName=',
customer:'customer/businessName?businessName=',
findByIdCustomer:'customer/',
contact:'customerContactNew/customerId?customerId=',
ALLUSERS:'userManagement/getAllUsers',
locationList:'location/list',
costCenter:'costcenter/list',
businessUnit:'businessunit/list'
};


export const SrSummary_Url={
  srSummaryList:'/sr-summary-list/'
}


export const Micro_account_url={
get_micro_account:'finance/microaccount/get_microaccount'
}
