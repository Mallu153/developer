export interface StoreManagement {
  bankTransactionType: string;
  referenceNo: string;
  transferAmount: number;
  transferFromBankInfo: string;
  transferFromId: number;
  transferToBankInfo: string;
  transferToId: number;
}
export interface StoreInfo {
  grassCashAmount: number;
  transitAmount: number;
  outStandingAmount: number;
  pettyCashAmount: number;
  pettyCashOpeningAmount: number;
}


export class ActionOnCashTransactionLine {
  rejectedRemarks: string;
  transactionId: number;
  transactionStatus: string;
}
