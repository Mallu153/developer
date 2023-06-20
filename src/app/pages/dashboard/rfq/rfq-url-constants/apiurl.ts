export const SUPPLIPER_URL={
  getAllSupplier:"customer/supplier/all",

}

export const RFQ_URL={
  //create:'create-rfq-request',
  findRFQById:'/get-rfq-request-info/',
  updateRFQ:'/modify-rfq-request',
  getSupplierInformation:'/get-supplier-rfq-relation-info',
  getCustomerDetails:'/get-service-request?requestId=',
  RfqRelationRelationSearch:'/rfq-relation-search',
  BPFTransition:'Transition/bpftransitions',
  updateTransition:'/modify/',
  supplierContacts:'customer/supplier-contacts/',
  send_email:'/send-rfq-user-mail?email='
}


export const ALLUSERS_URL ={
ALLUSERS:'userManagement/getAllUsers'
};

export const flightBooking_Price_url={
  bookingInfo:'flight/booking/bookingInfo',
  bookingInfoRfqId:'flight/booking/bookingInfo?rfqId='
}

export const hotel_Booking_Price_url={
  hotelbookingInfo:'hotel/bookingInfo',
  hotelbookingInfoRfqId:'hotel/bookingInfo?rfqId='
}
export const attraction_Booking_Price_url={
  attractionbookinginfo:'attractions/bookingInfo',

}

export const RFQ_List ={
openRFQList:'rfqs-list/open',
submittedRFQList:'rfqs-list/submitted',
contact: '/search/cantact?customerId=',
//searchCustomer: '/search/customer?searchString=',
supplier:'customer/supplier/businessName?businessName=',
getSupplierByBusinessName:'customer/supplier/businessName?businessName=',
getCustomerByBusinessName:'customer/businessName?businessName=',
getUsersByName:'userManagement/getUserByName?name='
};

export const HOTEL_RFQ_LIST={
createRfqRequest:'/hotel/create-rfq-request',
createHotelAddons :'/hotel/create-rfq-addons',
modifyeHotelAddons:'/hotel/modify-rfq-addons',
modifyHotelRequest:'/hotel/modify-rfq-request',
getHotelInfoByLine:'/hotel/get-rfq-info-by-line?id=',
RfqRelationRelationSearch:'/hotel/rfq-relation-search',
getHotelRfqInfo:'/hotel/get-rfq-info-by-line/'
}
export const pax_image_url = {
  imageposturl: "profile-upload",
  imagesget: 'get-all-files'
};

export const RFQ_EMAIL={
  rfq_email:'send-mail',
  rfq_email_1:'common/mail/send_mail'
}
export const RFQ_Ancillary={
  create:'/create-rfq-anx-request-line',
  update:'/update-rfq-anx-request-line/',
  findByid:'/anx-rfq-request-line/',
  getAnxRequestLineInfoByLineAndSrAndRfqId:'/anx-rfq-request-line/',
  ancillary_supplier_relation:'/rfq-anx-relation',
  RfqRelationRelationSearch:'/rfq-anx-relation-search',
  ancillarybookingInfo:'ancillary/bookingInfo',
  ancillarybookingInfoRfqId:'ancillary/bookingInfo?rfqId=',
  createModifyRequestLinePax:'/anx-rfq-request-line-pax/'
}
export const RFQAttractions={
  rfqAttractionsSupplier:'/rfq-attractions-relation',
  rfqAttractionsRequest:'/rfq/create-attractions-service-request',
  rfqAttractionsList:'/rfq/attractions-relation-search',
  findById:'/rfq/attractions-service-request-info/',
  updateRfq:'/rfq/update-attractions-service-request'

}

export const ALLRFQLIST={
//?productId=1
packageRfqSupplierSearch:'/package-rfq-supplier-relation-search'
}


export const RFQSequenceNo={
  generateSequenceNo:'/generate-rfq-sequence-no?requestId='
}


export const PackageApiList={
  packageRfqList:'/package/rfq-relation-search'
};


export const addToQuote={
  saveQuoteInfo:'save-quote-info'
};


export const whatsAppUrl={
 login :'auth/login',
 ticket:'tickets',
 message:'messages/14',
 sendWaMessageRFQ:'common/message/send_wa_message'
};
export const WhatsAppLoginDetails= {
  email: 'admin@whaticket.com',
  password: 'admin',
};

export const sendWaMessage={
  moduleId:11,
  moduleName:'RFQ'
}
