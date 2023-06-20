export class Faq {
  id: number;
  organization: number;
  department: number;
  reference: string;
  referenceId: number;
  answer: string;
  deviceId: string;
  deviceType: string;
  ipAddress: string;
  attribute1: string;
  attribute2: string;
  attribute3: string;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate?: any;
  status: string;
  question: Question;
}

export class Question {
  id: number;
  question: string;
  description: string;
  source: string;
  service: string;
  options: string;
  organization?: any;
  department?: any;
  reference: number;
  referenceType: string;
  language?: any;
  createdBy: string;
  createdDate: string;
  updatedBy: string;
  updatedDate: string;
  status: string;
  type: number;
}
