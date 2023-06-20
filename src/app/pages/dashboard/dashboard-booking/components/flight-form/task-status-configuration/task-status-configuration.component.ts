import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TeamInfo, TeamMember } from 'app/shared/models/task-config';

@Component({
  selector: 'app-task-status-configuration',
  templateUrl: './task-status-configuration.component.html',
  styleUrls: ['./task-status-configuration.component.scss'],
})
export class TaskStatusConfigurationComponent implements OnInit {
  @Input() teamList: TeamInfo[];
  @Input() teamMembersList: TeamMember[];
  @Input() transitionsData: any[];
  @Input() defaultStatus: any;
  //@Input() public form: FormGroup;
  teamAndMemebrsForm: FormGroup;

  submitted = false;
  constructor(private fb: FormBuilder) {}


  initializeForm() {
    this.teamAndMemebrsForm = this.fb.group({
      team:'',
      teamLeader:'',
      lineStatusId:''
    });

  }
  /******
   * form control get
   *
   * */
   get f() {
    return this.teamAndMemebrsForm.controls;
  }

  trackByFn(index, item) {
    return index;
  }

  ngOnInit(): void {

    this.initializeForm();
    if(this.teamList.length>0){
      this.teamAndMemebrsForm.patchValue({
        team:this.teamList[0]?.teamId,
        teamLeader:this.teamList[0]?.teamLeaderId,
        //lineStatusId:this.defaultStatus?.statusId
      });
    }
    if(this.defaultStatus){
      this.teamAndMemebrsForm.patchValue({
        lineStatusId:this.defaultStatus?.statusId
      });
    }
  }
}
