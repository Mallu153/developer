import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { sr_reports } from 'app/pages/dashboard/sr-reports/constants/sr-reports-url-constants';
import { SrReportsService } from 'app/pages/dashboard/sr-reports/services/sr-reports.service';
import { ApiResponse } from 'app/shared/models/api-response';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, concat, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-imports',
  templateUrl: './imports.component.html',
  styleUrls: ['./imports.component.scss'],
})
export class ImportsComponent implements OnInit {
  importForm: FormGroup;
  supplierReference$: Observable<any>;
  supplierReferenceInput$ = new Subject<string>();
  minLengthSupplierReferenceTerm = 6;
  supplierReferenceLoading = false;
  isEdit = false;
  submitted = false;
  @Input() parentData: string;
  pnrNoExists: boolean = false;
  requestId: any;
  contactId: any;
  constructor(
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    private srReports: SrReportsService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializationForm();
    this.route.queryParams.subscribe((params) => {
      this.contactId = params.contactId;
      this.requestId = params.requestId;
    });
  }
  initializationForm() {
    this.importForm = this.fb.group({
      pnrNo: ['', [Validators.required], [this.validatePNRNo.bind(this)]],
      officeId: '',
    });
  }
  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  validatePNRNo(control: AbstractControl, actionType?: string) {
    return this.srReports.getAutosuggestion(sr_reports.getSupplierReference, control.value).pipe(
      distinctUntilChanged(),
      debounceTime(500),
      map((res) => {
        if (!this.isEdit) {
          return res.length > 0 ? { pnrNoExists: true } : null;
        } else {
          if (actionType === 'change') {
            this.cd.markForCheck();
            return res.length > 0 ? { pnrNoExists: true } : null;
          } else {
            return null;
          }
        }
      })
    );
  }
  get f() {
    return this.importForm.controls;
  }
  public onSubmit() {
    this.submitted = true;
    if (this.importForm.invalid) {
      this.toastr.error('Please give all required fields to submit');
      return;
    }
    if (this.importForm.valid) {
      const saveData = {
        pnrNo: this.importForm.value.pnrNo,
        contactId: this.contactId,
        requestId: this.requestId,
        officeId: this.importForm.value.officeId,
      };
      console.log(saveData);
    }
  }
}
