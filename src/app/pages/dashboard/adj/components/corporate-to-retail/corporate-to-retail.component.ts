import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Pax, PNRDetails, PNRResponse } from '../../models/models';
import { AdjservicesService } from '../../services/adjservices.service';
/* import * as apiUrls from '../constants/constants';
import { SearchPaxDataService } from '../../service/search-pax-data.service';*/
// import { SearchResponsesService } from '../../service/search-responses.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
// import { ServiceRequestLine } from 'src/app/models/service-request-line';
import { formatDate } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// import { formatDate } from '@angular/common';
// import { AuthService } from 'app/shared/auth/auth.service';
@Component({
  selector: 'app-corporate-to-retail',
  templateUrl: './corporate-to-retail.component.html',
  styleUrls: ['./corporate-to-retail.component.scss']
})
export class CorporateToRetailComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  form: FormGroup;
  srForm: FormGroup;
  selectedFormGroup: FormGroup;
  selectedUserProfiles: Pax[] = [];
  showOnCheckedButton = false;
  hideonSubmitButton = true;
  PageTitle = 'SR - Contact Search';
  submitted: boolean;
  toastr: any;
  ApiResponseSearchData: any;
  customerIDCheck = false;
  createnewContact = false;
  apipaxId: any;
  resultShow: boolean;
  show = true;
  bizid: any;
  emptyData = false;
  todayDate = new Date();
  todayDate1: string;
  // timezone variable
  object: Pax;
  toastrService: any;
  authService: any;
  paxId: number;
  bookingId: string;
  supplierReference: string;
  constructor(
    // tslint:disable-next-line: no-shadowed-variable
    private adjService: AdjservicesService,
    private fb: FormBuilder,
    /*  private SearchPaxDataService: SearchPaxDataService,
     private SearchResponsesService: SearchResponsesService, */
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    // private toastrService: ToastrService,
  ) {
    // this.titleService.setTitle('Sr Search Data');
    this.todayDate1 = formatDate(this.todayDate, 'yyyy-MM-ddThh:mm:ss', 'en-US', '+0530');


  }

  ngOnInit(): void {
    // this.getPnrDetails();
    this.initializeForm();
    this.form = this.fb.group({
      pnrDetails: this.fb.array([])
    });
    // this.getSearchData();
    this.selectedFormGroup = this.fb.group({
      selectedUserProfiles: this.fb.array([]),
    });
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  // tslint:disable-next-line: typedef
  initializeForm() {
    this.srForm = this.fb.group({
      firstName: '',
      lastName: '',
      primaryEmail: ['', [Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      primaryPhoneNumber: ['', [Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$')]],
    });
  }
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  // tslint:disable-next-line: typedef
  createpnrDetailsArray(data: PNRDetails) {
    return this.fb.group({
      ID: data.ID,
      base_fare: data.base_fare,
      TicketNumber: data.TicketNumber,
      Tax: data.tax,
      SupplierTotal: data.supplier_total,
      Commission: data.Commission,
      M1: data.m1,
      M2: data.m2,
      D1: data.d1,
      Total: data.Total,
    });
  }
  pnrDetails(): FormArray {
    return this.form.get('pnrDetails') as FormArray;
  }

  getPnrData(data) {
    if (data && data.length > 0) {
      this.bookingId = data[0]?.booking_id;
      this.supplierReference = data[0]?.supplier_reference;
      this.preparePnrData(data);
    } else {
      alert("No Data")
    }
  }

  // tslint:disable-next-line: typedef
  preparePnrData(data: any[]) {
    const control = <FormArray>this.form.controls['pnrDetails'];
    for(let i = control.length-1; i >= 0; i--) {
            control.removeAt(i);
    }

    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < data.length; index++) {
      //  console.log(data[index]);
  if (data[index].supplier_sub_reference) {
  const form: FormGroup = this.fb.group({
    ID: Number(data[index].price_id),
    UniqueId: Number(data[index].price_id),
    BaseFare: Number(data[index].base_fare),
    TicketNumber: data[index].supplier_sub_reference,
    Tax: Number(data[index].tax),
    CommissionAmount: 0,
    SupplierTotal: Number(data[index].supplier_total),
    M1: Number(data[index].m1),
    M2: Number(data[index].m2),
    D1: Number(data[index].d1),
    D2: Number(data[index].d2),
    TotalAmount: Number(data[index].customer_total),
    AdjLPOAmount: 0,
    AdjCommissionAmount: 0,
    AdjVouAmount: 0,
  });
  this.pnrDetails().push(form);
}
    }
  }
  // tslint:disable-next-line: typedef
  customerTotal(data: any, pnrIndex: number) {
    // console.log(data);
    // console.log(pnrIndex);
    // tslint:disable-next-line: max-line-length
    const total: number = (Number(data.BaseFare)) - (Number(data.CommissionAmount)) + (Number(data.Tax)) + (Number(data.M1)) + (Number(data.M2)) - (Number(data.D1)) - (Number(data.D2));
    this.pnrDetails().at(pnrIndex).patchValue({ TotalAmount: total });
  }
  // tslint:disable-next-line: typedef
  voucherTotal(data: any, pnrIndex: number) {
    const total: number = (Number(data.LPO)) - (Number(data.AdjustCommision));
    this.pnrDetails().at(pnrIndex).patchValue({ Voucher: total });
  }
  // tslint:disable-next-line: typedef
  get f() {
    return this.srForm.controls;
  }
  // tslint:disable-next-line: typedef
  submit() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    const data: FormArray = this.selectedFormGroup.get('selectedUserProfiles') as FormArray;
    if (data.value.length > 1) {
      alert("you are selected many contacts")
      return;
    }
  //  console.log(this.form.value);
  //  console.log(data.value);
    const contactId = data.value[0].contactId;
    const customerId = data.value[0].customerId;
    this.adjService.
      createAdj(this.form.value.pnrDetails, "flight/booking/corporate-retail-adjustMents/" + this.bookingId + "/" + this.supplierReference + "/new-customer-contact/" + contactId + "/"+customerId) .pipe(takeUntil(this.ngDestroy$)).subscribe(res => {
      //  console.log(res);
        if (res.status === 200) {
          alert(res.message);
        } else {
          alert(res.message);
        }

      })
    /*  this.quoteService.updateQuote(this.quoteForm.value.quotes, 'updatequote.php').pipe(takeUntil(this.ngDestroy$)).subscribe((res: IQuoteResponse[]) => {
       console.log(res);
     }) */
    // console.log(this.form.value.PNRDetails);

  }
  // tslint:disable-next-line: typedef
  onSubmitPaxSearch() {
    this.submitted = true;
    const mail = this.srForm.value.primaryEmail;
    const primaryPhoneNumber = this.srForm.value.primaryPhoneNumber;
    const firstName = this.srForm.value.firstName;
    const lastName = this.srForm.value.lastName;
    let searchObj = {};
    if (mail) {
      //searchObj['primaryEmail'] = this.srForm.value.primaryEmail;
      if (this.srForm.invalid) {
        return;
      }
      if (this.srForm.valid) {
        searchObj['primaryEmail'] = this.srForm.value.primaryEmail;
        this.searchPax(searchObj);
        //  this.searchPax(searchObj);
        //this.searchPax("?primaryEmail=" + this.srForm.value.primaryEmail);
        //this.searchPax("?primaryEmail=" + this.srForm.value.primaryEmail);
        // this.router.navigate(['/dashboard/adj/search']);
      }
      return;
    } else if (primaryPhoneNumber) {
      searchObj['primaryPhoneNumber'] = this.srForm.value.primaryPhoneNumber;
      if (this.srForm.invalid) {
        return;
      }
      if (this.srForm.valid) {
        this.searchPax(searchObj);

      }
    } else if (firstName && lastName) {
      if (firstName && lastName) {
        searchObj['firstName'] = this.srForm.value.firstName;
        searchObj['lastName'] = this.srForm.value.lastName;
        if (this.srForm.invalid) {
          return;
        }
        if (this.srForm.valid) {
          this.searchPax(searchObj);
          // this.router.navigate(['/dashboard/adj/search']);
        }
      } else {
        this.toastr.error('Please give both first and last name for search', 'Error');
      }
    } else {
      this.toastr.error('Please give any of field and search', 'Error');
    }

  }
  searchPax(data: any) {

    this.adjService.SearchPax(data, 'pax/search').pipe(takeUntil(this.ngDestroy$)).subscribe((contactList: any) => {
      const result: any = contactList;
      if (result.status) {
        let data = result.data;
        if (data && data?.length > 0) {
          data.forEach(element => {
            element.checked = false;
          });
          this.object = data;
          this.cdr.detectChanges();
        } else {
          alert("No data found");
        }


      }
    });
  }
  gotoNewPaxForm() {
    this.router.navigate(['/dashboard/request/new-create-pax']);
  }

  gotoContactForm() {
    this.router.navigate(['/dashboard/request/contact']);
  }

  /*  reset(){
     this.submitted = false;
     this.srForm.reset();
     this.createnewContact=false
     this.customerIDCheck=false
   } */
  /*  */


  onProfileCheckboxChage(e, j) {
    const data: FormArray = this.selectedFormGroup.get('selectedUserProfiles') as FormArray;
    if (e.target.checked) {
      data.push(new FormControl(j));
    } else {
      const index = data.controls.findIndex(x => x.value === j);
      data.removeAt(index);
    }
   // console.log(data.value);
  }


  trackByFn(index, item) {
    return index;
  }

}
