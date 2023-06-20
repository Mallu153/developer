import { Component, Input, OnInit } from '@angular/core';

export class AttractionPax {
  paxNo: number;
  paxRefence: number;
  paxType: string;
  selectedAllGroup:string;
}
export class PaxInfo{
assign:number;
createdBy:number;
createdDate:Date;
dob:Date;
email:string;
firstName:string;
issuedCountry:number;
issuedCountryName:string;
lastName:string;
nationality:number;
nationlaityName:string;
passport:string;
passportExpiredDate:Date;
passportIssueDate:Date
paxCode:string;
paxId:number;
paxIsDeleted:boolean;
paxType:number;
phone:string;
prefix:string;
requestId:number;
requestLineId:number;
requestLinePaxId:number;
statusId:number;
updatedBy:number;
}
@Component({
  selector: 'app-package-pax-info',
  templateUrl: './package-pax-info.component.html',
  styleUrls: ['./package-pax-info.component.scss'],
})
export class PackagePaxInfoComponent implements OnInit {
  @Input() paxInfo: PaxInfo[];
  @Input() addons: any[];
  @Input() attractionPaxDeatils: AttractionPax[];
  attractionPaxInfo=[];
  @Input() sourceType: string;
  constructor() {}

  ngOnInit(): void {
  /*   console.log('paxInfo',this.paxInfo);
    console.log('attractionPaxDeatils',this.attractionPaxDeatils); */

    if(this.attractionPaxDeatils?.length>0){

      const attractionsPax=this.attractionPaxDeatils?.map((item)=>{
        if(item?.paxType?.split('-')[0]==='ADT'){
          const pax= {
            paxCode:"Adult",
            assign:Number(item.paxType?.split('-')[1])
          }
          return pax;
        }
        if(item?.paxType?.split('-')[0]==='CHD'){
          const pax= {
            paxCode:"Child",
            assign:Number(item.paxType?.split('-')[1])
          }
          return pax;
        }
        if(item?.paxType?.split('-')[0]==='INF'){
          const pax= {
            paxCode:"Infant",
            assign:Number(item.paxType?.split('-')[1])
          }
          return pax;
        }
       });

       if(this.paxInfo?.length>0){
        //for (let paxindex = 0; paxindex < this.paxInfo?.length; paxindex++) {
          this.paxInfo=this.paxInfo?.filter((v)=>{
            for (let index = 0; index < attractionsPax?.length; index++) {
              if((v.assign===attractionsPax[index]?.assign)&&(v.paxCode===attractionsPax[index]?.paxCode)){
                return v;
              }
            }
           });
         //}

       }
    }
  }

  trackByFn(index, item) {
    return index;
  }
}
