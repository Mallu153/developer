export interface ResourcesAssignment {
  productId: number;
  bookingTypeId: number;
  cabinClassId: number;
  paxCount: number;
  typeOfJourneyId: number;
  hotelNoOfDays?: number;
  hotelDestination?: string;
  hotelRoomsCount?: number;
  hotelNightsCount?: number;
  budgetAmount: number;
  companyId: number;
  locationId: number;
  costCenterId: number;
  userId: number;
  customerId: number;
  customerCategoryId: number;
  customerRatingId: number;
  customerTypeId: number;
  ticketType: string;
  segments: Segment[];
}

export interface Segment {
  fromCity: string;
  toCity: string;
  marketingCarrier: string;
  operatingCarrier: string;
}
