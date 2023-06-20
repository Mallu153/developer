import { formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AncillarySelectComponent } from 'app/pages/dashboard/dashboard-request/components/search-result/ancillary-select/ancillary-select.component';
import { DashboardRequestService } from 'app/pages/dashboard/dashboard-request/services/dashboard-request.service';
import { AuthService } from 'app/shared/auth/auth.service';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { LoginResponse } from 'app/shared/models/login-response';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-myrequestsbtn',
  templateUrl: './myrequestsbtn.component.html',
  styleUrls: ['./myrequestsbtn.component.scss'],
})
export class MyrequestsbtnComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();

  userDetails: LoginResponse;

  todayDate = new Date();
  todayDate1: string;

  keys = [];
  flightBtn = PERMISSION_KEYS.CBT_DASHBOARD.CBT_DASHBOARD_FLIGHT_REQUEST_BTN;
  hotelBtn = PERMISSION_KEYS.CBT_DASHBOARD.CBT_DASHBOARD_HOTEL_REQUEST_BTN;
  ancillaryBtn = PERMISSION_KEYS.CBT_DASHBOARD.CBT_DASHBOARD_ANCILLARY_REQUEST_BTN;
  packageBtn = PERMISSION_KEYS.CBT_DASHBOARD.CBT_DASHBOARD_PACKAGE_REQUEST_BTN;
  activitiesBtn = PERMISSION_KEYS.CBT_DASHBOARD.CBT_DASHBOARD_ACTIVITIES_REQUEST_BTN;
  amendmentsBtn = PERMISSION_KEYS.CBT_DASHBOARD.CBT_DASHBOARD_AMENDMENTS_REQUEST_BTN;

  constructor(
    public router: Router,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private modalService: NgbModal,
    private dashboardRequestService: DashboardRequestService
  ) {
    this.todayDate1 = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');
  }

  /**
   *
   *
   * @ancillary dynamic form dropdown
   */
  onAncillarySelect() {
    const modalRef = this.modalService.open(AncillarySelectComponent, {
      size: 'xl',
      backdrop: 'static',
      animation: true,
    });
    modalRef.componentInstance.name = 'Add Person';
    modalRef.result.then(
      (result) => {
        if (result) {
          this.onCreateRequestForCbt('ancillary', result);
        }
      },
      (err) => {}
    );
  }
  /**
   *
   *
   * create request for cbt
   *
   */
  onCreateRequestForCbt(routesName: string, serviceTypeId?: string) {
    if (this.userDetails) {
      let holiday: number = 0;
      if (routesName === 'holidays') {
        holiday = 1;
      } else {
        holiday = 0;
      }
      const srRequestHeaderData = {
        createdBy: this.authService.getUser(),
        createdDate: this.todayDate1,
        customerId: this.userDetails?.bizId,
        contactId: this.userDetails?.contactId,
        requestStatus: 1,
        priorityId: 1,
        severityId: 1,
        packageRequest: holiday,
      };
      this.dashboardRequestService
        .createServiceRequestLine(srRequestHeaderData)
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(
          (requestResponse: any) => {
            if (requestResponse.requestId) {
              if (routesName === 'ancillary') {
                if (serviceTypeId !== null) {
                  this.router.navigate([`/dashboard/booking/${routesName}`], {
                    queryParams: {
                      requestId: requestResponse.requestId,
                      contactId: this.userDetails?.contactId,
                      serviceTypeId: btoa(escape(serviceTypeId)),
                    },
                  });
                } else {
                  this.toastr.error('No Services found');
                }
              } else {
                this.router.navigate([`/dashboard/booking/${routesName}`], {
                  queryParams: { requestId: requestResponse.requestId, contactId: this.userDetails?.contactId },
                });
              }

              this.cdr.markForCheck();
            }
          },
          (error) => {
            this.toastr.error('Oops! Something went wrong please try again', 'Error');
            this.cdr.markForCheck();
          }
        );
    }
  }

  /**
   *
   *
   * @Amendments Request MyrequestsbtnComponent
   */
  onCreateRequestForCbtAmendments() {
    if (this.userDetails && this.userDetails?.bizName && this.userDetails?.bizId && this.userDetails?.contactId) {
      this.router.navigate([`/dashboard/reports/booking`], {
        queryParams: {
          booking_customer_id: this.userDetails?.bizId,
          booking_customer: this.userDetails?.bizName,
          booking_contact_id: this.userDetails?.contactId,
        },
      });
    }
  }

  ngOnInit(): void {
    this.userDetails = this.authService.getUserDetails();
    this.keys = this.authService.getPageKeys();
  }

  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
}
