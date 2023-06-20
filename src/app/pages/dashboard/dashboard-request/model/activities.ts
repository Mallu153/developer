export interface Activities {
  attractionAttribute1?: string;
  attractionAttribute2?: string;
  attractionAttribute3?: string;
  attractionDescription: string;
  attractionName: string;
  attractionRequestId: number;
  attractionStatus?: number;
  attractionUpdatedBy?: number;
  attractionUpdatedDevice?: string;
  attractionUpdatedIp?: string;
  lines: Line[];
}

export interface Line {
  attractionHeaderId?: number;
  attractionId: number;
  attractionLineCity: string;
  attractionLineCountry: string;
  attractionLineDate: string;
  attractionLineDay: number;
  attractionLineId?: number;
  attractionLineLocation: string;
  attractionLineName: string;
  attractionLinePassengerStatus?: number;
  attractionLinePaxCount: number;
  passengers: Passenger[];
}

export interface Passenger {
  attractionLineId?: number;
  attractionLinePassengerDob: string;
  attractionLinePassengerEmail: string;
  attractionLinePassengerFristName: string;
  attractionLinePassengerGender: string;
  attractionLinePassengerId: number;
  attractionLinePassengerLastName: string;
  attractionLinePassengerMiddleName: string;
  attractionLinePassengerPhone: string;
  attractionLinePassengerStatus?: number;
  attractionLinePassengerTitle: string;
  attractionLinePassengerType: string;
  attractionLinePaxId: number;
}
