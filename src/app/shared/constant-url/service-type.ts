import { environment } from 'environments/environment';
const SERVICE_TYPE = environment.SERVICE_CONFIG; // be url
const SERVICE_FE = ''; //environment.E_SERVICE_FE_API; // fe url
const SERVICE_BPF = environment.SERVICE_CONFIG; // bpf url
const SERVICE_PRICING = ''; //environment.E_SERVICE_PRICING; // pricing url
const SERVICE_TRANSITION = ''; //environment.E_SERVICE_TRANSITION; // pricing url
export const SERVICE_TYPE_URL = {
  GET_SERVICE_TYPE_HEADER: SERVICE_TYPE + 'service-type-header/',
  GET_SERVICE_TYPE_FORM_LINES: SERVICE_TYPE + 'service-type-lines-form-data/',
  GET_PRICING_BY_SERVICE_TYPE_HEADER_ID: SERVICE_TYPE + 'service_pricing/getPricingData?serviceHeaderId=',
  GET_SERVICE_DOCUMENTS_BY_SERVICE_TYPE_HEADER_ID: SERVICE_TYPE + 'service_documents/headerId?headerId=',
  GET_SERVICE_ATTACHMENTS_BY_SERVICE_TYPE_HEADER_ID: SERVICE_TYPE + 'service_attachments/get-attachments?headerId=',
  GET_SERVICE_ASSIGNMENTS_BY_SERVICE_TYPE_HEADER_ID: SERVICE_TYPE + 'service_assignment/headerId?headerId=',
  GET_SERVICE_STATUS_CONFIGURATION_BY_DEFAULT_STATUS: SERVICE_BPF + 'status-owner-mapping/get-team-info?deafultStatus=',
};

export const SERVICE_FE_URL = {
  GET_SERVICE_REQUEST_BY_KEY_VALUE: SERVICE_FE + 'fzservice/',
  CREATE_SERVICE_REQUEST: SERVICE_FE + 'srequest/create',
  UPDATE_SERVICE_REQUEST: SERVICE_FE + 'srequest/update',
  CREATE_ATTACHMENTS: SERVICE_FE + '/attach/create',
  UPDATE_ATTACHMENTS: SERVICE_FE + '/attach/update',
};

export const MASTER_URL = {
  GET_PREFIX: SERVICE_TYPE + 'master/master_prefix/all',
  GET_ORGANIZATION: SERVICE_TYPE + 'organization/orgList',
  GET_DEPARTMENT_BY_ORGANIZATION: SERVICE_TYPE + 'Departments/organizationId?id=',
  GET_GENDER: SERVICE_TYPE + 'master/master_gender/all',
  GET_FAQ: SERVICE_TYPE + 'faq/get-faq-by-reference/',
  GET_STATUS_TREE: SERVICE_BPF + 'Transition/geneerate-transition-tree?fromstatusId=',
  GET_SUPPORT_PRICING: SERVICE_TYPE + 'service_pricing/getPricingInfo?serviceHeaderId=',
};

export const SERVICE_PRICING_URL = {
  CREATE_RECEIPT: SERVICE_PRICING + 'create-receipt',
  GET_RECEIPT_BY_SERVICE_REQUEST: SERVICE_PRICING + 'receipt-info/',
};

export const SERVICE_TRANSITION_URL = {
  GET_TRANSITION_BY_CURRENT_STATUS: SERVICE_TRANSITION + 'transitions/info/',
};
