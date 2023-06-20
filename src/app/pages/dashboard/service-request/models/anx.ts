export interface AnxRequest {
  anxLineAddons: AnxLineAddons;
  anxLineAdtCount: number;
  anxLineAttr1: string;
  anxLineAttr2: string;
  anxLineAttr3: string;
  anxLineAttr4: string;
  anxLineAttr5: string;
  anxLineAttr6: string;
  anxLineChdCount: number;
  anxLineInfCount: number;
  anxLineJson: AnxLineAddons;
  anxLineLpoAmount: number;
  anxLineLpoDate: string;
  anxLineLpoNumber: string;
  anxLineRequestId: number;
  anxLineStatus: number;
  anxLineType: string;
  anxLineTypeId: number;
  deviceInfo: string;
  deviceIp: string;
  loggedInUserId: number;
}

interface AnxLineAddons {}
export interface AnxPerson {
  adult:number;
  child:number;
  infant:number;
  srId:number;
  srLine:number;
}
