export interface Attractions {
  attractionAttribute1?: string;
  attractionAttribute2?: string;
  attractionAttribute3?: string;
  attractionCreatedBy: number;
  attractionCreatedDevice: string;
  attractionCreatedIp: string;
  attractionDescription: string;
  attractionName: string;
  attractionRequestId: number;
  lines: Line[];
}

export interface Line {
  attractionId: number;
  attractionLineCity: string;
  attractionLineCountry: string;
  attractionLineDate: string;
  attractionLineDay: number;
  attractionLineLocation: string;
  attractionLineName: string;
  attractionLinePaxCount: number;
  passengers: Passenger[];
}

export interface Passenger {
  attractionLinePassengerDob: string;
  attractionLinePassengerEmail: string;
  attractionLinePassengerFristName: string;
  attractionLinePassengerGender: string;
  attractionLinePassengerLastName: string;
  attractionLinePassengerMiddleName: string;
  attractionLinePassengerPhone: string;
  attractionLinePassengerTitle: string;
  attractionLinePassengerType: string;
  attractionLinePaxId: number;
}

export interface Supplier {
  createdBy: number;
  createdDate: Date;
  requestId: number;
  requestLineId: number;
  rfqId?: number;
  sno?: number;
  status?: number;
  supplierContactId?: number;
  supplierId: number;
  updatedBy?: number;
  updatedDate?: Date;
}
