import { environment } from 'environments/environment';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import { ApiResponse } from 'app/shared/models/api-response';

@Component({
  selector: 'app-dynamic-form-builder',
  templateUrl: './dynamic-form-builder.component.html',
  styleUrls: ['./dynamic-form-builder.component.scss'],
})
export class DynamicFormBuilderComponent implements  OnInit, OnDestroy {
  @Input() formInput: [];
  @Input() fields;
  @Input() formPatch: any;
  @Input() sourceType:string;
  @Output() submittedData = new EventEmitter<any>();
  dynamicFieldForm: FormGroup;
  starRow: string = "<div class='form-row'>";
  starEndRow: string = "</div><div class='form-row'>";
  endRow: string = '</div>';
  submitted = false;
  serverDataList: any[];
  show = false;
  title: string;
  isEdit: boolean = false;
  processedArray: any[] = [];
  loading: boolean = false;

  private eventsSubscription: Subscription;
  @Input() events: Observable<void>;
  @Input() resetevents: Observable<void>;
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private serviceTypeService: ServiceTypeService,
    private cd: ChangeDetectorRef
  ) {}



  ngOnInit(): void {
    this.eventsSubscription = this.events.subscribe(() => this.onSubmit());
    //this.eventsSubscription = this.resetevents.subscribe(() => this.reset());
    this.initializeForm();
    if (this.fields) {
      this.formSetup(this.fields);
    }
    if (this.formInput && this.formPatch) {
      this.isEdit = true;
      this.formSetup(this.formInput);
    } else {
      if (this.formInput) {

        this.formSetup(this.formInput);
      }
    }
  }
  ngOnDestroy() {
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }

  initializeForm() {
    this.dynamicFieldForm = this.fb.group({});
  }
  get f() {
    return this.dynamicFieldForm.controls;
  }

  reset(){
    this.submitted=false;
    this.dynamicFieldForm.reset();
  }

  formSetup(data) {
    // this.serverDataList = data;
    //console.log(data);
    let dummyData = [...data];
    dummyData = JSON.parse(JSON.stringify(dummyData));
    let mainTempArray: any = [];
    let tempArray: any[] = [];
    for (let i = 0; i < dummyData.length; i++) {
      tempArray.push(dummyData[i]);
      if (dummyData[i].ui.newRow == true) {
        mainTempArray.push(tempArray);
        tempArray = [];
      }
      if (i === dummyData.length - 1) {
        mainTempArray.push(tempArray);
      }
    }
    mainTempArray.forEach((main, mainIndex) => {
      main.forEach((element, subIndex) => {
        if (element.service) {
          element.source = this.getDataByService(element, mainIndex, subIndex);
        }
        /*  if (element.validators?.required) { */
        let validators = [];
        // validators.push(Validators.required);
        if (element.validators?.required) {
          validators.push(Validators.required);
        }
        if (element.validators?.min > 0) {
          validators.push(Validators.min(element.validators.min));
        }
        if (element.validators?.max > 0) {
          validators.push(Validators.max(element.validators.max));
        }
        if (element.validators?.minLength > 0) {
          validators.push(Validators.minLength(element.validators.minLength));
        }
        if (element.validators?.maxLength > 0) {
          validators.push(Validators.maxLength(element.validators.maxLength));
        }
        if (element.type === 'email') {
          validators.push(Validators.email);
        }
        if (element.type === 'date') {
          if (element.validators.maxDate || element.validators.minDate) {
            validators.push(this.dateRangeValidator(element.validators.minDate, element.validators.maxDate));
          }
          // validators.push(Validators.email);
        }
        /*   if(element.validators.isSpecialCharacters) {
          validators.push(Validators.pattern(/^[\w\s]+$/));
         } */
        if (validators.length > 0) {
          if (element.type === 'checkbox') {
            this.dynamicFieldForm.addControl(element.name, new FormArray([]));
          } else {
            this.dynamicFieldForm.addControl(element.name, new FormControl('', validators));
          }
        } else {
          if (element.type === 'checkbox') {
            this.dynamicFieldForm.addControl(element.name, new FormArray([]));
          } else {
            this.dynamicFieldForm.addControl(element.name, new FormControl(''));
          }
        }
      });
    });
    this.processedArray = mainTempArray;
    if (this.isEdit && this.formPatch) {
      for (const key of Object.keys(this.formPatch)) {
        const isArray = Array.isArray(this.formPatch[key]);
        if (typeof this.formPatch[key] === 'object' && !isArray) {
          this.dynamicFieldForm.get(key).patchValue(this.formPatch[key]?.id);
        } else if (isArray) {
          const formArray: FormArray = this.dynamicFieldForm.get(key) as FormArray;
          this.formPatch[key]?.forEach((element) => {
            formArray.push(new FormControl(element?.id));
          });
        } else {
          this.dynamicFieldForm?.get(key)?.patchValue(this.formPatch[key]);
        }
      }
    }
  }


  /**
   *
   * @param data
   * @param mainIndex
   * @param subIndex
   * @param id
   * @returns
   */
  getDataByService(data: any, mainIndex: number, subIndex: number, id?: string) {
    let url = environment.E_SERVICE_DYNAMIC_HOST + data.service;
    if (id) {
      url = url + id;
    }
    this.eventsSubscription= this.serviceTypeService.read(url).subscribe((res: ApiResponse) => {
      if (res.data) {
        this.processedArray[mainIndex][subIndex].source = res.data;
        // console.log(this.processedArray[mainIndex][subIndex].source);
        this.cd.markForCheck();
        /* this.serverDataList.forEach((element) => {
            if (element.name === data.name) {
              element.source = res.data;
            }
          }); */
      }else{
        this.processedArray[mainIndex][subIndex].source = [];
      }
    });
    return [];
  }

  dateRangeValidator(min: Date, max: Date): ValidatorFn {
    return (control) => {
      if (!control.value) return null;
      const dateValue = new Date(control.value);
      if (min && dateValue < new Date(min)) {
        return { message: 'error message' };
      }
      if (max && dateValue > new Date(max)) {
        return { message: 'error message' };
      }
      null;
    };
  }
  onCheckChange(event: any, control) {
    const formArray: FormArray = this.dynamicFieldForm.get(control.name) as FormArray;
    /* Selected */
    if (event.target.checked) {
      // Add a new control in the arrayForm
      formArray.push(new FormControl(event.target.ngValue));
      // formArray.push(this.fb.group({data: event.target.ngValue}));
    } else {
      /* unselected */
      // find the unselected element
      let i: number = 0;
      formArray.controls.forEach((ctrl: FormControl) => {
        if (ctrl.value.id == event.target.ngValue.id) {
          // Remove the unselected element from the arrayForm
          formArray.removeAt(i);

          return;
        }
        i++;
      });
    }
  }
  /**
   *
   * @param event selection event
   * @param control field data
   * @param mainIndex
   * @param subIndex
   */
  onSelectChange(event: any, control: any, mainIndex: number, subIndex: number) {
    let id: any = event.target.value;
    this.processedArray.forEach((main, mainIndex) => {
      main.forEach((element, subIndex) => {
        if (element.configId === Number(control.dependentField)) {
          element.source = this.getDataByService(element, mainIndex, subIndex, id?.id);
        }
      });
    });
  }

  formReset(){
    this.submitted = false;
    this.dynamicFieldForm.reset();
  }
  /**
   * submit form data
   */
  onSubmit(): void {

    this.submitted = true;


    if (this.dynamicFieldForm.invalid) {

      return;
    }
    this.loading = true;
    let formData = { ...this.dynamicFieldForm.value };
    formData = JSON.parse(JSON.stringify(formData));
    this.processedArray.forEach((main) => {
      main.forEach((v) => {
        //get radio and select lov data
        if (v.type === 'select' || v.type === 'radio') {
          v.source.forEach((s) => {
            if (s.id == this.f[v.name].value) {
              formData[v.name] = s;
            }
          });
        }
        // get checkbox data
        if (v.type === 'checkbox') {
          if (formData[v.name].length > 0) {
            let checkBoxData = [];
            formData[v.name].forEach((check) => {
              v.source.forEach((s) => {
                if (s.id == Number(check)) {
                  checkBoxData.push(s);
                }
              });
            });
            formData[v.name] = checkBoxData;
          }
        }
      });
    });

    this.submittedData.emit(formData);
    if(this.sourceType =='package'){
      this.formReset();
    }

  }
}
