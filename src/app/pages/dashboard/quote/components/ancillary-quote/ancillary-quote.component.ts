import { ActivatedRoute, Route } from '@angular/router';
import { ChangeDetectorRef, Component, Input, OnInit, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QuotesService } from '../../services/quotes.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { srLine } from '../../models/quotes-api-response';

@Component({
  selector: 'app-ancillary-quote',
  templateUrl: './ancillary-quote.component.html',
  styleUrls: ['./ancillary-quote.component.scss']
})
export class AncillaryQuoteComponent implements OnInit {
  srId: any;
  iconClass: string;
  productId: number = 1;
  quoteInfo:any=[];
  viewGroupQuoteInfo:any;
  srLineNumbers:any;
  showdiv1=[];
  showdiv2=[];
  constructor(
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private quotesServices:QuotesService,
    private cd: ChangeDetectorRef,
    private fb : FormBuilder,
    private toastr: ToastrService
    ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.srId = params.sr_id;
      this.fetchData();
    });
  }

  fetchData(): void {
    // Make the GET API call using HttpClient
      this.quotesServices.getQuoteInfo( this.srId, 'quote-info/').subscribe((res) => {
        const result: any = res;
        if (result.status === 200) {
          this.quoteInfo = result.data;
          this.groupSrLinesBySrLineId();
          this.cd.markForCheck();
        } else {
          this.toastr.error('Oops! Something went wrong while fetching the tax categories data ', 'Error');
        }
      })
    }

    groupSrLinesBySrLineId(): void {
      const groupedData: { [key: number]: any[] } = this.quoteInfo[0].srLine.reduce((result, quote) => {
        if (result.hasOwnProperty(quote.srLineId)) {
          result[quote.srLineId].push(quote);
        } else {
          result[quote.srLineId] = [quote];
        }
        return result;
      }, {});
      console.log("groupedData", groupedData);
      this.viewGroupQuoteInfo=groupedData;
      const groupedSrLineIds = this.getUniqueSrLineIds();
     console.log(groupedSrLineIds);
     this.srLineNumbers=groupedSrLineIds;
     // console.log(this.srLineNumbers)
     //console.log(groupedLines[groupedSrLineIds[0]][0]?.options[0]?.quoteSegments[0]?.segFrom);
    this.cd.markForCheck();
  }

  getUniqueSrLineIds(): number[] {
    const srLineIdsSet = new Set<number>();
    this.quoteInfo?.forEach((dataItem: any) => {
      dataItem.srLine.forEach((srLineItem: any) => {
        srLineIdsSet.add(srLineItem.srLineId);
      });
    });

    return Array.from(srLineIdsSet);
  }
  OnClick1(mainIndex:number){
    this.showdiv1[mainIndex]=!this.showdiv1[mainIndex];
  }

  OnClick2(mainIndex:number){
    this.showdiv2[mainIndex]=!this.showdiv2[mainIndex];
  }

  disabledProperty:boolean=true;

  disenmethod(){
    this.disabledProperty=!this.disabledProperty;
  }

  trackByFn(index, item) {
    return index;
  }



}

