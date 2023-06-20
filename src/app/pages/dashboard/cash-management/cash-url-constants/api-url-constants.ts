export const SEARCH_URL = {
  AGENT_URL: '/userManagement/getUserByName?name=',
  BANK_ACCOUNT_URL: 'emp_bank/search-bank/',
};

export const Store_Management_url = {
  storeInfo: 'agent/storeInfo/',
  storeTransactions: 'storeCashTransactions/',
  transactionsApprovals: 'agent/cashTransactionsApprovalsList/',
  actionOnCashTransactionLine: 'actionOnCashTransactionLine/',
  mailCount_url: 'mail-info',
};
export const Quote = {
  getAgents: 'userManagement/getAllUsers',
  notFullFilledAgent: 'sr-created-not-fulfilled-aging-report?agentId=',
  getCount_Report_By_Agent: 'quote-count-report-by-agent?agentId=',
  getAgeingNotFulfilledReport: 'sr-created-not-fulfilled-aging-report?agentId=',
  getQuoteButNotSentAgeingReport: 'quote-added-but-sent-aging-report?agentId=',
  getQuoteSentNotApproved: 'quote-sent-not-approved-aging-report?agentId=',
  getApprovedNotFulfilled: 'quote-approved-not-fulfilled-aging-report?agentId=',
};
export const getAgentAllCashTransactions = {
  CASH_URL: 'agent/cash/transactions/',
  LIABILITY_URL: 'agent/cl/transactions/',
};

export const QUOTE_AGING = {
  getQouoteAgeingReport: 'quote-ageing-report',
  getBookingAgeingReport: 'booking-not-confirmed-ageing-report',

  getReceiptPaymentAgeingReport: 'receipt-payment-ageing-report',
};
