export class RFQ {
  rfqUniqueId?: string;
  rfqSrRequestId: number;
  rfqSrRequestSearchId: number;
  rfqType: string;
  rfqSrSearchType: string;
  rfqSrSearchRequestDestination: string;
  rfqSrSearchRequestData: string;
  rfqSrSearchCheckIn: string
  rfqSrSearchCheckOut: string;
  rfqSrSearchNights: number;
  rfqSrSearchRooms: number;
  rfqSrSearchAdults: number;
  rfqSrSearchChild: number;
  rfqSrSearchResidency: string;
  rfqSrSearchNationality: string;
  rfqSrSearchHotelRating: number;
  rfqStatus?: number;
  rfqAssignedToTeamId?: number;
  rfqAssignedToUserId?: number;
  createdby: number;
}
