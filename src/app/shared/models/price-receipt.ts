export interface PriceReceipt {
  linesData: LinesData[];
  modesData: ModesData[];
  receiptAmount: number;
  receiptBy: number;
  receiptContactCountryId: number;
  receiptContactEmail: string;
  receiptContactId: number;
  receiptContactMobile: string;
  receiptContactName: string;
  receiptCreatedBy: number;
  receiptCreatedDevice: string;
  receiptCreatedIp: string;
  receiptCurrencyCode: string;
  receiptCustomerCompanyId: number;
  receiptCustomerCostCenterId: number;
  receiptCustomerId: number;
  receiptCustomerLocationId: number;
  receiptCustomerTypeId: number;
  receiptDate: any;
  receiptExternalRemarks: string;
  receiptInternalRemarks: string;
  receiptSrId: number;
  receiptSrLineId: number;
  receiptStatusCode: string;
  receiptStatusId: number;
  receiptUserCompanyId: number;
  receiptUserCostCenterId: number;
  receiptUserLocationId: number;
}

export interface ModesData {
  modeAmount: number;
  modeBank: string;
  modeBankBranch: string;
  modeBankReferenceNumber: string;
  modeCardCharges: number;
  modeCardNumber: string;
  modeCardType: string;
  modeChequeDate: string;
  modeChequeEncashDate: string;
  modeChequeNumber: string;
  modeEmployee: any;
  modeExternalRemarks: string;
  modeName: string;
  modePercentage: number;
  modeStatusCode: string;
  modeStatusId: number;
  modeTypeId: number;
}

export interface LinesData {
  lineAmount: number;
  lineExternalRemarks: string;
  lineInternalRemarks: string;
  lineItemId: number;
  lineItemName: string;
  linePriceId: number;
  lineTaxAmount: number;
  lineTaxBreakInfo: string;
}
