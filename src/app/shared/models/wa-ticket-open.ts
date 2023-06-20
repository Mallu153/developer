export interface OpenTicket {
  contact_number: number;
  contact_name: string;
  request_for: string;
}
export interface TicketApiResponse {
  status:  boolean;
  message: string;
  ticket:  string;
}
