export interface AddPrice {
  createdBy?: number;
  updatedBy?: number;
  ipAddress: string;
  itineraryId: number;
  itineraryPriceLines: ItineraryPriceLine[];
  validFromDate: string;
  validToDate: string;
}

export interface ItineraryPriceLine {
  adtPrice: number;
  chdPrice: number;
  createdBy?: number;
  updatedBy?: number;
  createdDate: string;
  dynamicPrice: string;
  infPrice: number;
  ipAddress: string;
  itemId: number;
  itineraryLineId: number;
  setName: string;
  setOption: string;
  setPrimary: string;
  strandedPrice: string;
}
