export interface UnissuedSalesOrder {
  message: string;
  status: number;
  data: UnissuedSalesOrders[];
  errors: any[];
}

export interface UnissuedSalesOrders {
  pendingCount: number;
  pendingAmount: number;
}

export interface UnInvoicedTicket {
  message: string;
  status: number;
  data: UnInvoicedTickets[];
  errors: any[];
}

export interface UnInvoicedTickets {
  linesAmount: number;
  linesCount: number;
}

export interface CreditLimitCount {
  message: string;
  status: number;
  data: CreditLimitCounts[];
  errors: any[];
}

export interface CreditLimitCounts {
  total_credit_limit: number;
  available_balance: number;
}
