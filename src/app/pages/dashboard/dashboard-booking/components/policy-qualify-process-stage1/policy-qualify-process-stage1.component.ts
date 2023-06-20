import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-policy-qualify-process-stage1',
  templateUrl: './policy-qualify-process-stage1.component.html',
  styleUrls: ['./policy-qualify-process-stage1.component.scss']
})
export class PolicyQualifyProcessStage1Component implements OnInit {
  @Input() policyList: any=[];

  hideTableContent=[true];
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  //console.log(this.policyList);
  this.openSuccessedList();
  this.openFaliedList();
  }

  openSuccessedList(){
    if(this.policyList[0]?.processedData?.successList?.length > 0){
      for (let index = 0; index < this.policyList[0]?.processedData?.successList.length; index++) {
        //const element = this.policyList[0]?.processedData?.successList[index];
        this.showTable(index);
      }
    }
  }
  openFaliedList(){
    if(this.policyList[0]?.processedData?.successList?.length == 0){
      for (let index = 0; index < this.policyList[0]?.processedData?.failedList.length; index++) {
        //const element = this.policyList[0]?.processedData?.failedList[index];
        this.showTable(index);
      }
    }
  }
  showTable(index:number){
    this.hideTableContent[index]=!this.hideTableContent[index]
  }

  trackByFn(index, item) {
    return index;
  }

}
