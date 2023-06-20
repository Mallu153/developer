export interface PolicyQualifyProcessStage1 {
  productId: number;
  customerId?: number;
  bookingDate: string;
  cabinClassId?: number;
  tktTypeId: number;
  tripTypeId?: number;
  routes: Route[];
}

export interface Route {
  fromCity: string;
  toCity: string;
}
