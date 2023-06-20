import { environment } from "environments/environment";


const TRAVEL_CBT_DEALS_API = environment.DEALS;
export const LIABILITY={
  USER_APP_ADMIN_TYPE:"AppAdmin",
  USER_APP_CBT_TYPE:"CbtUser",
  CREDIT_LIMIT_INFO:TRAVEL_CBT_DEALS_API+'liability/credit-limit-Info/',
};

