export interface Passengers {
  paxId: number;
  prefix?: number;
  firstName: string;
  lastName: string;
  phone: number;
  email: string;
  nationality?: any;
  dob?: Date;
  passport?: string;
  issuedCountry?: any;
  paxType?: string;
  paxRequestLine?: any;
  passportIssueDate?: Date;
  passportExpiredDate?: Date;
  requestId?: number;
  requestLineId?: number;
}
