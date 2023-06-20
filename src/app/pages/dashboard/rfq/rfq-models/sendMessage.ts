export interface SendMessage {
  contact_number: number;
  contact_name: string;
  sender_id: number;
  message: string;
  module: string;
  module_id: number;
  reference: number;
  sub_reference: number;
  supplier_id:number
}
export class WaApiResponse{
  message: string;
  status: boolean;
}
