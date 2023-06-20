export const SERVICE_REQUEST_MODULE = 'service';
export const SERVICE_REQUEST = {
  SERVICE_REQUEST_DYNAMIC: 'create/:requestId/:contactId/:serviceTypeId',
  SERVICE_REQUEST_DYNAMIC_UPDATE: 'edit/:requestId/:contactId/:serviceTypeId/:anxLineId',
  SERVICE_REQUEST_EMPLOYEE_SERVICE: 'employment-service/:serviceTypeId',
  SERVICE_REQUEST_PAYMENT: 'payment/:departmentName/:serviceTypeName/:serviceTypeId/:serviceRequestId',
  SERVICE_REQUEST_RECEIPT: 'receipt/:departmentName/:serviceTypeName/:serviceTypeId/:serviceRequestId',
};
