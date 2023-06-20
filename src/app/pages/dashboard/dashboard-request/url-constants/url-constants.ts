export const searchpax_url = {
  searchpax: 'pax/search',
  paxtableSearch: 'pax/search-pax',
  titlelov: 'gen/master_title/all',
  designationlov: 'gen/master_designation/all',
  relationtypelov: 'gen/master_relation_type/all',
  rolelov: 'gen/master_role/all',
  countyLov: 'company/country/all',
  nationalityLov: 'gen/nationality/all',
};
export const newPax_create_url = {
  create: 'customerContactNew/contactWrapper',
  find: 'customerContactNew/id?id='
  //find: '/paxdata/pax/id?id=',
}
export const business_list_url = {
  get: 'customer/all',
}
export const contact_const_url = {
  create: 'customerContactNew/contactWrapper',
  customerContactCreate: 'customerContactNew/create',
  //get: '/paxdata/customerContactNew/customerId?customerId=',
  //find: '/paxdata/customerContactNew/id?id=',
};

export const request_hotel_url = {
  getHotelsNamesMaster: 'htl/hotel-names/all',
  getCountryMaster: 'company/country/all',
  getNationaltyMaster: 'gen/nationality/all',
  hotelrating: 'htl/master_hotel_rating/all',
  createHotel: '/create-hotel-request',
  createPassengers: '/create-hotel-passengers',
  getHotelLines: '/get-hotel-info-by-line',
  updateHotel: '/modify-hotel-request'
};
export const pax_image_url = {
  imageposturl: "profile-upload",
  imagesget: 'get-all-files'
};

export const addons_url = {
  masterAddons: 'htl/master_hotel_addons/all',
  createAddons: '/create-hotel-addons',
  updateAddons: '/modify-hotel-addons'
}

export const rfq_url = {
  create: 'create'
}


export const srsearchList_url = {
  //srsearchList: '/sr-search',
  srsearchList: '/service-request-search',
  //searchCustomer: '/search/customer?searchString=',
  searchContact: '/search/cantact?customerId='
};


export const master_data_url={
product: 'gen/master_products/all',
fetchCustomerDetailsBySrId:'/get-customer-details?requestId='
};

export const sr_assignment ={
  flightassignment:'resources-assignment',
  getTransitionList: '/get-status-by-module/2',
}
export const  SrSummaryData ={
  SAVESRSUMMARYDATA:'/save-sr-summary-data'
}


export const Holiday_Package={
  createPackageRequest:'/create-package-request',
  getPackageRequest:'/get-package-request?requestId=',
  modifyPackageRequest:'/modify-package-request',
  packageActivity:'/PackageActivity/get-data-serach',
  packageItinerary:'/package-detailed-info?requestId=',
  roomName:'common/master/get_hotel_content_types_rooms',
  roomType:'common/master/get_hotel_content_types_boards',
  attractionsServiceRequest:'/create-attractions-service-request',
  attractionsGetData:'/attractions-service-request-info?attractionSrId=',
  attractionsUpdate:'/update-attractions-service-request/attractionSrId?attractionSrId='
}
export const SUPPLIPER_URL={
  getAllSupplier:"customer/supplier/all",

}



export const PackageRequestList ={
  PackageRequestSearch:'/package/sr-addl-search',
  customer:'customer/businessName?businessName=',
};

export const CommunicationModule ={
  moduleId:1,
  moduleName:'Service Request',
  communicationModuleLink:'create-communication-module-link'
};


export const OpenTicket ={
  createTicket:'common/message/send_wa_message'
};


export const flightSuggestions={
  getflightSuggestions:'/sr-flight-suggestions/'
}


export const serviceRequestCommvnicationtimeLine={
  get:'common/service_request_communication_time_line?service_request='
};


export const forexMasterData={
  currency:'company/master_currency/all',
  forexMOP:'gen/master_forex_mop/all'
};


export const packageHolidayListView={
  searchSrPackage:'/service-request-package/'
};


export const  policy={
  policyTemplateProcessStage1:'policy-qualify-process-stage1'
};

export const previewPackageItineraryInfo ={
  getPackageItenaryInfo:'/package-itenary-info?requestId='
  };
