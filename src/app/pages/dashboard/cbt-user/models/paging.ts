export class Page {
  // The number of elements in the page
  size: number = 0;
  // The total number of elements
  totalElements: number = 0;
  // The total number of pages
  totalPages: number = 0;
  // The current page number
  pageNumber: number = 0;
  sortBy?: string;
  sortType?: string;
}

/**
 * An array of data with an associated page object used for paging
 */
export class PagedData<T> {
  data = new Array<T>();
  page = new Page();
}

export class ApiResponsePaging {
  message: string;
  status: number;
  data: any[];
  errors?: any[];
  currentPage: number;
  totalElements: number;
  totalPages: number;
}
