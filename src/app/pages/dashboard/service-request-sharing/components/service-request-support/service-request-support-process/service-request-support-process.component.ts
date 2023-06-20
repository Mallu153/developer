import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MASTER_URL, SERVICE_TRANSITION_URL, SERVICE_TYPE_URL } from 'app/shared/constant-url/service-type';
import { ServiceAssignment } from 'app/shared/models/service-request';

import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { dummyProcessData } from './dummyData';
/* import { dummyData } from 'dummyData' */

@Component({
  selector: 'app-service-request-support-process',
  templateUrl: './service-request-support-process.component.html',
  styleUrls: ['./service-request-support-process.component.scss'],
})
export class ServiceRequestSupportProcessComponent implements OnInit , OnDestroy  {
  @Input() serviceType: any;
  items: any[];
  key: 'transitionDto';
  dummyData: any = dummyProcessData;
  serviceAssignment: ServiceAssignment;
  ngDestroy$ = new Subject();
  constructor(private serviceTypeService: ServiceTypeService) {}

  ngOnInit(): void {
    if (this.serviceType) {
      this.getServiceTypeAssignments(this.serviceType?.id);
    }
    // get configuration

    /*    let childData = (data) => {
      return data?.map( (v) =>  {
        v.linkColor = "red";
        v.background = "red";
        v.color = "white";
        return {

          ...v,
          data: {toStatus: v.ToStatusName},
          isShow: false,
          children: v.childs?.length > 0 ? childData(v.childs) : [],


        };

      })
    };
    this.items = childData(this.dummyData);
    return; */
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  recurse(node) {
    for (var i = 0, count = node.children.length; i < count; i++) {
      this.recurse(node.children[i]);
    }
  }
  getServiceTypeAssignments(serviceTypeId: any) {
    this.serviceTypeService.read(SERVICE_TYPE_URL.GET_SERVICE_ASSIGNMENTS_BY_SERVICE_TYPE_HEADER_ID + serviceTypeId).pipe(takeUntil(this.ngDestroy$)).subscribe((res:any) => {
        const serviceResult = res;
        if (serviceResult.status === 200) {
          if (serviceResult.data && serviceResult.data?.length > 0) {
            this.serviceAssignment = serviceResult.data[0];
            this.getTransitions(this.serviceAssignment.defaultStatus.toString());
          }
        }
      });
  }
  getTransitions(statusId: string) {
    this.serviceTypeService
      .read(SERVICE_TRANSITION_URL.GET_TRANSITION_BY_CURRENT_STATUS + statusId)
      .pipe(takeUntil(this.ngDestroy$)).subscribe((res) => {
        let data = res.data;
        //this.items = res.data;
        /*  linkColor: "red",
     background: "red",
       color: "white", */
        let childData = (data) => {
          return data?.map((v) => {
            v.linkColor = 'red';
            v.background = 'red';
            v.color = 'white';
            return {
              ...v,
              data: { toStatus: v.toStatus },
              isShow: false,
              children: v.childs?.length > 0 ? childData(v.childs) : [],

              /*  if(v.transitionDto && v.transitionDto.length > 0) {
               childData(v.transitionDto);
             } */
            };
          });
        };
        this.items = childData(data);
      });
  }
}
