import { Products } from 'app/pages/dashboard/dashboard-request/model/products-data';
import { TableData } from './table-data';

export interface SearchResult {
  customers: TableData[];
  total: number;
}

export interface SearchProductResult {
  customers: Products[];
  total: number;
}
