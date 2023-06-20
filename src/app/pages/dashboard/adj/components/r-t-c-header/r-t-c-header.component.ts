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
  selector: 'app-r-t-c-header',
  templateUrl: './r-t-c-header.component.html',
  styleUrls: ['./r-t-c-header.component.scss']
})
export class RTCHeaderComponent implements OnInit, OnDestroy {
  ngDestroy$ = new Subject();
  RTCheader: FormGroup;
  @Output() pnrData = new EventEmitter();
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
      this.RTCheader = this.fb.group({
       /*  customerid: '',
        contactid: '', */
        pnrno: ['', [Validators.required]]
      });
    }
    // tslint:disable-next-line: typedef
    get f() {
      return this.RTCheader.controls;
    }

    onPnrSearch() {
      if(this.RTCheader.invalid) {
        return;
      }
        const dataTosend = {
          supplier_reference: [
            this.RTCheader.value.pnrno
          ]
        };
        this.AdjservicesService.getPnrDetails(dataTosend, 'reports/booking/get_report').pipe(takeUntil(this.ngDestroy$)).subscribe((res) => {
         // console.log(res);
          const result: PNRResponse = res;
          this.pnrData.emit(res.data);
        }, (err) => {
          //console.log(err);
          this.toastr.error(err)
        });

    }
  }
