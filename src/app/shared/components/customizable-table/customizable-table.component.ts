import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { Observable, of } from 'rxjs';
import { NgbdSortableHeader, SortEvent } from './directive/sortable.directive';
import { CustomizableTableService } from './service/customizable-table.service';
import { UserProfile } from 'app/shared/models/user-profile';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-customizable-table',
  templateUrl: './customizable-table.component.html',
  styleUrls: ['./customizable-table.component.scss'],
  providers: [CustomizableTableService, DecimalPipe],
})
export class CustomizableTableComponent implements OnInit {
  // Input and Outoput decorators to access the table data
  @Input() tableData$: Observable<UserProfile>;
  // On submit the table data
  @Output() onTableSubmit = new EventEmitter<UserProfile[]>();
  selectedUserProfiles: UserProfile[] = [];
  customers$: Observable<UserProfile[]>;
  total$: Observable<number>;

  @ViewChildren(NgbdSortableHeader) headers: QueryList<NgbdSortableHeader>;
   // pagination
  page = 1;
  pageSize = 5;
  constructor(public customizableTableService: CustomizableTableService, private modalService: NgbModal) {
    this.total$ = customizableTableService.total$;
    
    
  }

  ngOnInit(): void {}

  /**
   * Triggers event on selected profile from the table
   * @param event
   * @param user
   */
  onProfileCheckboxChage(event, user: UserProfile) {
    if (event.target.checked) {
      this.selectedUserProfiles.push(user);
    } else if (!event.target.checked) {
      const indexOfuser = this.selectedUserProfiles.findIndex((user: UserProfile) => user.id === user.id);
      if (!!!indexOfuser && indexOfuser > -1) {
        this.selectedUserProfiles = this.selectedUserProfiles.slice(0, indexOfuser);
      }
    }
  }

  onSort({ column, direction }: SortEvent) {
    // resetting other headers
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.customizableTableService.sortColumn = column;
    this.customizableTableService.sortDirection = direction;
  }

  /**
   * A method to close the add person modal on clicking go button
   */
  closeModalWindowForAddPerson() {
    if (this.modalService.hasOpenModals()) {
      this.modalService.dismissAll();
    }
  }

  /**
   * On form data submit triggers event with UserProfile data
   */
  onFormDataSubmit() {
    this.onTableSubmit.emit(this.selectedUserProfiles);
    this.closeModalWindowForAddPerson();
  }
}
