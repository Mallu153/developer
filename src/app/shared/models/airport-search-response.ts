export interface AirportSearchResponse {
  id: number;
  name: string;
  code: string;
  countryCode: string;
  country: string;
  type: string;
  cityCode: string;
  city: string;
  status: boolean;
  timeZone: string;
  createdBy: number;
  createdDate?: Date;
  updatedBy: number;
  updatedDate?: string;
}
