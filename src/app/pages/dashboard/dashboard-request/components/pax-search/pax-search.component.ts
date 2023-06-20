import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DashboardRequestService } from '../../services/dashboard-request.service';
import { ApiResponse } from '../../model/api-response';
import * as apiUrls from '../../url-constants/url-constants';
import { SearchPaxDataService } from '../../services/search-pax-data.service';
import { SearchResponsesService } from '../../services/search-responses.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PERMISSION_KEYS } from 'app/shared/data/app-premission-key';
import { RolePermissionsService } from 'app/shared/services/role-permissions.service';
import { AuthService } from 'app/shared/auth/auth.service';
import { log } from 'console';
@Component({
  selector: 'app-pax-search',
  templateUrl: './pax-search.component.html',
  styleUrls: ['./pax-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaxSearchComponent implements OnInit, OnDestroy {

  keys=[];
  searchButtonKey = PERMISSION_KEYS.REQUEST.CREATE_REQUEST_PAGE_SERARCH_KEY;
  paxButtonKey = PERMISSION_KEYS.REQUEST.CREATE_REQUEST_PAX_BTN;
  contactButtonKey = PERMISSION_KEYS.REQUEST.CREATE_REQUEST_CONTACT_BTN;
  ngDestroy$ = new Subject();
  //page title
  PageTitle = 'SR - Contact Search';
  //formgroup define
  searchpaxForm: FormGroup;

  submitted = false;
  //search data
  ApiResponseSearchData: any;
  show = true;
  resultShow = false;
  bizid: any;
  emptyData = false;
  createnewContact = false;
  apipaxId: any;
  //initial false
  customerIDCheck = false;
  loading: boolean = false;
  waNumberCheck: boolean = false;
  ticketNumber: string;


  constructor(
    private fb: FormBuilder,
    private titleService: Title,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dashboardRequestService: DashboardRequestService,
    private SearchPaxDataService: SearchPaxDataService,
    private SearchResponsesService: SearchResponsesService,
    private authService: AuthService,
    private premissionsServices: RolePermissionsService
  ) {

    this.titleService.setTitle('Sr Contact Search');
  }

  ngOnInit(): void {
    this.keys= this.authService.getPageKeys();
    this.initializeForm();
    this.getQueryParams();
  }
  ngOnDestroy() {
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }



  getQueryParams(){
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((param) => {
      if (param && param.wa_number && param.ticketNumber&&param.contact_email&& param.contact_name) {
        this.loading = true;
        this.waNumberCheck = true;
        this.ticketNumber = param.ticketNumber;
        this.searchpaxForm.patchValue({
          //primaryPhoneNumber: atob(unescape(param.wa_number)),
          primaryEmail:atob(unescape(param.contact_email)),
          //firstName:atob(unescape(param.contact_name)),

        });
        const waChatTicketNumber = {
          //primaryPhoneNumber: Number(atob(unescape(param.wa_number))),
          primaryEmail:atob(unescape(param.contact_email)),
          //firstName:atob(unescape(param.contact_name)),
        };
        this.searchPax(waChatTicketNumber);
      }else if (param && param.wa_number && param.ticketNumber&& param.contact_name) {
        this.loading = true;
        this.waNumberCheck = true;
        this.ticketNumber = param.ticketNumber;
        this.searchpaxForm.patchValue({
          primaryPhoneNumber: atob(unescape(param.wa_number)),
          //firstName:atob(unescape(param.contact_name)),

        });
        const waChatTicketNumber = {
        primaryPhoneNumber: Number(atob(unescape(param.wa_number))),
        //firstName:atob(unescape(param.contact_name)),
        };
        this.searchPax(waChatTicketNumber);
      } else {
        this.waNumberCheck = false;

      }
    });
  }



  initializeForm() {
    this.searchpaxForm = this.fb.group({
      firstName: '',
      lastName: '',
      primaryEmail: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      primaryPhoneNumber: [''],
      //primaryPhoneNumber: ['', [Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$')]],
    });
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  //get the formcontrols here
  get f() {
    return this.searchpaxForm.controls;
  }
  //search pax service call
  onSubmitPaxSearch() {
    this.submitted = true;
    const mail = this.searchpaxForm.value.primaryEmail;
    const primaryPhoneNumber = this.searchpaxForm.value.primaryPhoneNumber;
    const firstName = this.searchpaxForm.value.firstName;
    const lastName = this.searchpaxForm.value.lastName;
    let searchObj = {};
    if (mail) {
      searchObj['primaryEmail'] = this.searchpaxForm.value.primaryEmail;
      if (this.searchpaxForm.invalid) {
        return;
      }
      if (this.searchpaxForm.valid) {
        this.searchPax(searchObj);
      }
    } else if (primaryPhoneNumber) {
      searchObj['primaryPhoneNumber'] = this.searchpaxForm.value.primaryPhoneNumber;
      if (this.searchpaxForm.invalid) {
        return;
      }
      if (this.searchpaxForm.valid) {
        this.searchPax(searchObj);
      }
    } else if (firstName && lastName) {
      if (firstName && lastName) {
        searchObj['firstName'] = this.searchpaxForm.value.firstName;
        searchObj['lastName'] = this.searchpaxForm.value.lastName;
        if (this.searchpaxForm.invalid) {
          return;
        }
        if (this.searchpaxForm.valid) {
          this.searchPax(searchObj);
        }
      } else {
        this.toastr.error('Please give both first and last name for search', 'Error');
      }
    } else {
      this.toastr.error('Please give any of field and search', 'Error');
    }
  }
  searchPax(data: any) {
    this.dashboardRequestService
      .SearchPax(data, apiUrls.searchpax_url.searchpax)
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((contactList: ApiResponse) => {
        const result: ApiResponse = contactList;
        if (result.status === 200) {
          //this.toastr.success(result.message, 'Success');
          this.ApiResponseSearchData = result.data;
          this.loading = false;
          if (this.ApiResponseSearchData.length > 0) {
            for (let c = 0; c < this.ApiResponseSearchData.length; c++) {
              const element = this.ApiResponseSearchData[c];
              if (element?.customerId === null) {
                //alert("customer id is null");
                this.customerIDCheck = true;
                this.createnewContact = false;
                this.SearchPaxDataService.data = this.searchpaxForm.value;
              } else {
                this.ApiResponseSearchData?.forEach((v) => {
                  if (this.ApiResponseSearchData?.length === 1) {
                    v['checked'] = true;
                  } else {
                    v['checked'] = false;
                  }
                });
                this.SearchResponsesService.data = this.ApiResponseSearchData;
                //method
                this.appendingQueryParamstoNextRouter();
              }
            }
          }

          /* this.SearchResponsesService.data = this.ApiResponseSearchData;
        this.router.navigate(['/dashboard/request/search-result']);
        this.cdr.detectChanges(); */
          this.apipaxId = result.data[0]?.id;
          const resultLength = this.ApiResponseSearchData?.length;
          if (resultLength) {
            this.resultShow = true;
            this.show = false;
            this.emptyData = false;
            this.cdr.detectChanges();
          }
          //this.cdr.detectChanges();
        } else {
          if (result.message === 'NOT_FOUND') {
            const totalLength = result.data.length;
            if (totalLength === 0) {
              this.SearchPaxDataService.data = this.searchpaxForm.value;
              this.emptyData = true;
              this.createnewContact = true;
              this.customerIDCheck = false;
              this.loading = false;
              this.cdr.detectChanges();
            }
            if (this.createnewContact === true && this.waNumberCheck === true) {
              this.gotoNewPaxForm();
            }
          } else {
            this.loading = false;
            this.toastr.error('Oops! Something went wrong ', 'Error');
          }
        }
      });
  }

  /*
   *Goto New Create Pax
   *
   *
   */
  gotoNewPaxForm() {
    //this.router.navigate(['/dashboard/request/new-create-pax']);
    const businessid = 0;
    const mail = this.searchpaxForm.value.primaryEmail;
    const primaryPhoneNumber = this.searchpaxForm.value.primaryPhoneNumber;
    const firstName = this.searchpaxForm.value.firstName;
    const lastName = this.searchpaxForm.value.lastName;

    if (mail || primaryPhoneNumber || firstName || lastName) {
      if (this.waNumberCheck) {
        this.router.navigate(['/dashboard/request/new-create-pax'], {
          queryParams: {
            fname: firstName,
            lname: lastName,
            phoneNumber: primaryPhoneNumber,
            email: mail,
            sources: 'waTicket',
            wa_number: this.searchpaxForm.value.primaryPhoneNumber,
            ticketNumber: this.ticketNumber,
          },
        });
      } else {
        this.router.navigate(['/dashboard/request/new-create-pax'], {
          queryParams: {
            fname: firstName,
            lname: lastName,
            phoneNumber: primaryPhoneNumber,
            email: mail,
          },
        });
      }
    }

  }

  gotoContactForm() {
    //this.router.navigate(['/dashboard/request/contact']);
    const businessid = 0;
    const paxId= this.ApiResponseSearchData[0]?.id;
    const mail = this.searchpaxForm.value.primaryEmail;
    const primaryPhoneNumber = this.searchpaxForm.value.primaryPhoneNumber;
    const firstName = this.searchpaxForm.value.firstName;
    const lastName = this.searchpaxForm.value.lastName;


    if (mail || primaryPhoneNumber || firstName || lastName) {
      if (this.waNumberCheck) {
        this.router.navigate(['/dashboard/request/contact'], {
          queryParams: {
            fname: firstName,
            lname: lastName,
            pax_no:paxId,
            phoneNumber: primaryPhoneNumber,
            email: mail,
            sources: 'waTicket',
            wa_number: this.searchpaxForm.value.primaryPhoneNumber,
            ticketNumber: this.ticketNumber,
          },
        });
      } else {
        this.router.navigate(['/dashboard/request/contact'], {
          queryParams: {
            fname: firstName,
            lname: lastName,
            phoneNumber: primaryPhoneNumber,
            email: mail,
            pax_no:paxId,
          },
        });
      }
    }


  }

  reset() {
    this.submitted = false;
    this.searchpaxForm.reset();
    this.createnewContact = false;
    this.customerIDCheck = false;
  }

  appendingQueryParamstoNextRouter() {
    this.route.queryParams.pipe(takeUntil(this.ngDestroy$)).subscribe((params) => {
     const sourceData = {
      sources: 'waTicket',
      };

      const data = {
        ...params,
        ...sourceData
      };

      if (this.waNumberCheck) {
        this.router.navigate(['/dashboard/request/search-result'], {
          queryParams: data,
        });
      } else {
        this.router.navigate(['/dashboard/request/search-result']);
      }
    });
  }


}
