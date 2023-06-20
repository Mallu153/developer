import { environment } from './../../../../../environments/environment';
const SERVICE_REQUEST_URL = environment.serviceRequest_url;

export const ANX_API = {
  CREATE: SERVICE_REQUEST_URL + '/create-anx-request-line',
  FIND: SERVICE_REQUEST_URL + '/anx-request-line/',
  UPDATE: SERVICE_REQUEST_URL + '/update-anx-request-line/',
};
export const ANX_PAX_API={
CREATEMODIFYREQUESTLINEPAX:SERVICE_REQUEST_URL + '/anx-request-line-pax',
}

export const ANX_ADDONS={
  CREATEUPDATEANXADDONS:SERVICE_REQUEST_URL + '/anx-addons',

}
