import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-package-segment-details',
  templateUrl: './package-segment-details.component.html',
  styleUrls: ['./package-segment-details.component.scss']
})
export class PackageSegmentDetailsComponent implements OnInit {

  @ViewChild('widgetsContent') widgetsContent: ElementRef;
  @Input()flightDetailsList = [];
  @ViewChild('segmentList') segmentList: ElementRef;
  constructor() { }

  ngOnInit(): void {
  }


  trackByTableFn(index, item) {
    return index;
  }
  segmentScrollLeft() {
    this.segmentList.nativeElement.scrollLeft -= 100;
  }

  segmentScrollRight() {
    this.segmentList.nativeElement.scrollLeft += 100;
  }

}
