import { DecimalPipe } from '@angular/common';
import { Injectable, PipeTransform } from '@angular/core';
import { UserProfile } from 'app/shared/models/user-profile';

import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { tap, debounceTime, switchMap, delay } from 'rxjs/operators';
import { SortDirection } from '../directive/sortable.directive';
import { SearchResult } from '../model/search-result';
import { State } from '../model/state';

function compare(v1, v2) {
  return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
}

function sort(data: UserProfile[], column: string, direction: string): UserProfile[] {
  if (direction === '') {
    return data;
  } else {
    return [...data].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

export function matchesSearch(data: UserProfile, term: string, pipe: PipeTransform) {
  return (
    data.firstName.toLowerCase().includes(term) ||
    data.email.toLowerCase().includes(term) ||
    pipe.transform(data.mobile).includes(term)
  );
}

@Injectable({ providedIn: 'root' })
export class CustomizableTableService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _customers$ = new BehaviorSubject<UserProfile[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _state: State = {
    page: 1,
    pageSize: 4,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
  };

  constructor(private pipe: DecimalPipe) {
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._search()),
        delay(200),
        tap(() => this._loading$.next(false))
      )
      .subscribe((result: any) => {
        this._customers$.next(result.customers);
        this._total$.next(result.total);
      });

    this._search$.next();
  }

  get customers$() {
    return this._customers$.asObservable();
  }
  get total$() {
    return this._total$.asObservable();
  }
  get loading$() {
    return this._loading$.asObservable();
  }
  get page() {
    return this._state.page;
  }
  get pageSize() {
    return this._state.pageSize;
  }
  get searchTerm() {
    return this._state.searchTerm;
  }

  set page(page: number) {
    this._set({ page });
  }
  set pageSize(pageSize: number) {
    this._set({ pageSize });
  }
  set searchTerm(searchTerm: string) {
    this._set({ searchTerm });
  }
  set sortColumn(sortColumn: string) {
    this._set({ sortColumn });
  }
  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  private _set(patch: Partial<State>) {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(): Observable<SearchResult> {
    const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;

    // 1. sort
    let customers = sort(this._customers$.getValue(), sortColumn, sortDirection);

    // 2. filter
    customers = customers.filter((customer) => matchesSearch(customer, searchTerm, this.pipe));
    const total = customers.length;

    // 3. paginate
    customers = customers.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    return of({ customers, total });
  }
}
