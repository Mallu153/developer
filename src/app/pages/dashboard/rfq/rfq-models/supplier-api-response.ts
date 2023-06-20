export interface Supplier {
  customerId: number;
  businessName: string;
  shortName: string;
  type: number;
  code: null;
  category: number;
  industry: number;
  subIndustry: number;
  startDate: Date;
  endDate: Date;
  isCustomer: boolean;
  custRegistrationNumber: number;
  isSupplier: boolean;
  supplRegistrationNumber: number;
  rating: number;
  legacyID: null;
  wfStatus: number;
  status: string;
  createdDate: null;
  updatedDate: Date;
  createdBy: null;
  updatedBy: number;
}
