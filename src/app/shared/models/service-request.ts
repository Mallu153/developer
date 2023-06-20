import { PriceReceipt } from './price-receipt';

export interface ServiceRequest {
  cancelled?: boolean;
  cancelledDate?: string;
  close?: boolean;
  closeDate?: string;
  createdBy: number;
  createdDate?: string;
  customerId: number;
  data: string;
  id?: number;
  open: boolean;
  srStatusId: number;
  srTypeId: number;
  submittedDate?: string;
  updatedBy?: number;
  updatedDate?: string;
  userId: number;

  updatedDevice?: string;
  updatedIP?: string;
  createdDevice: string;
  createdIP: string;
  browserCreatedDate: any;
  browserUpdatedDate: any;
}
export interface ServiceTypePricing {
  priceLineId: number;
  itemId: number;
  itemName: string;
  taxPrice: number;
  discount: number;
  totalPrice: number;
  taxBreakup: TaxBreakup[];
  itemTotalPrice: number;
  itemPrice: number;
  description?: string;
}

interface TaxBreakup {
  taxId: number;
  taxCategoryId: number;
  taxName: string;
  taxCode: string;
  taxDescription: string;
  budgetFrom: number;
  budgetTo: number;
  slabPercentage: number;
  slabAmount: number;
}

export class ServiceAttachments {
  attachmentsId: number;
  name: string;
  description: string;
  language: string;
  allowedExtensions: number;
  mandatory: boolean;
  conditional: boolean;
  field?: any;
  operator?: any;
  value?: any;
  headerId: number;
  createdBy: string;
  updatedBy: string;
  createdDate: string;
  updatedDate: string;
  status: string;
}

export class ServiceDocuments {
  id: number;
  name: string;
  description: string;
  language: string;
  url?: any;
  headerId: number;
  createdBy: string;
  updatedBy: string;
  createdDate: string;
  updatedDate: string;
  status: string;
}

export class ServiceAssignment {
  createdBy: string;
  createdDate: string;
  defaultStatus: number;
  endDate: string;
  headerId: number;
  id: number;
  startDate: number;
  status: string;
  team: number;
  updatedBy: string;
  updatedDate: string;
}

export interface ServiceFeAttachments {
  additional: boolean;
  createdBy: number;
  createdDate?: string;
  id?: number;
  srRequestId: number;
  srAttachmentId: number;
  status: boolean;
  updatedBy?: number;
  updatedDate?: string;
  url: string;
}

export class ServiceRequestSharedInfo {
  serviceRequest?: ServiceRequest;
  serviceType?: any;
  attachments?: any;
  receipt?: PriceReceipt;
  priceData?: any;
}
