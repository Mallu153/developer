export class FlexRequest {
  product: number;
  requester: number;
  service_request: number;
  service_request_line: number;
  flex_request?: FlexRoute[];
}
export class FlexRoute {
  route: FlexRouteInfo[];
}
export class FlexRouteInfo {
  city_departure: string;
  city_arrival: string;
  date_departure: string;
  time_departure: string;
  carrier: string;
  class: string;
  rbd: string;
}

export class FlexResponse {
  status: boolean;
  message: string;
  flex_request_id: string;
  flex_request_lines: FlexRequestLine[];
}

export class FlexRequestLine {
  _id: string;
}
