import { environment } from "environments/environment";

const TRAVEL_CBT_REPORT_API = environment.reports;
const TRAVEL_CBT_DEALS_API = environment.DEALS;
export const CBT_API_URL = {
  QUOTE_OPEN_LIST: TRAVEL_CBT_REPORT_API +'quotes-list/sent',
  CREDIT_LIMIT_COUNT: TRAVEL_CBT_DEALS_API +'liability/credit-limit-Info/',
  UNISSUED_SALES_ORDERS_COUNT: TRAVEL_CBT_REPORT_API +'sales/sales-order-pending-count/',
  UN_INVOICED_TICKET_COUNT: TRAVEL_CBT_REPORT_API +'un-invoiced-lines-count/',
};
