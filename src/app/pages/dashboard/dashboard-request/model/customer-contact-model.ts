export class Contact {
  nationality?: number;
  dob?: Date;
  passport?: string;
  issuedCountry?: number;
  id?: number;
  paxId: number;
  customerId: number;
  prefix: number;
  firstName: string;
  middleName: string;
  lastName: string;
  designationId: number;
  designationName?: string;
  roleId: number;
  primaryEmail: string;
  primaryCCP: number;
  primaryPhoneNumber: number;
  secondaryEmail: string;
  secondaryCCP: number;
  secondaryPhoneNumber: number;
  telephoneNumber: number;
  remarksAndNotes: string;
  startDate: Date;
  endDate: Date;
  status: number;
  createdBy?: number;
  updatedBy?: number;
  length?: number;
}
export class ContactSendPayLoad {
  paxModel: Contact;
}
