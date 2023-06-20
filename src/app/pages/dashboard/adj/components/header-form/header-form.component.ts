import { searchpax_url } from './../../../dashboard-request/url-constants/url-constants';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AdjservicesService } from '../../services/adjservices.service';
import { Pax, PNRResponse } from '../../models/models';
import { create } from 'core-js/core/object';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-header-form',
  templateUrl: './header-form.component.html',
  styleUrls: ['./header-form.component.scss']
})
export class HeaderFormComponent implements OnInit , OnDestroy{
headerForm: FormGroup;
@Output() pnrData = new EventEmitter();
ngDestroy$ = new Subject();
PageTitle = 'Sr-header Search';
  submitted: boolean;
  object: Pax;
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    // tslint:disable-next-line: no-shadowed-variable
    private AdjservicesService: AdjservicesService,
  ) {
   }
  ngOnInit(): void {
    this.initializeForm();
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  // tslint:disable-next-line: typedef
  initializeForm() {
    this.headerForm = this.fb.group({
     /*  customerid: '',
      contactid: '', */
      pnrno: ['', [Validators.required]]
    });
  }
  // tslint:disable-next-line: typedef
  get f() {
    return this.headerForm.controls;
  }

  onPnrSearch() {
    if(this.headerForm.invalid) {
      return;
    }
      const dataTosend = {
        supplier_reference: [
          this.headerForm.value.pnrno
        ]
      };
      this.AdjservicesService.getPnrDetails(dataTosend, '/reports/booking/get_report').pipe(takeUntil(this.ngDestroy$)).subscribe((res) => {
       // console.log(res);
        const result: PNRResponse = res;
        this.pnrData.emit(res.data);
      }, (err) => {
        console.log(err);
      });

  }
}
