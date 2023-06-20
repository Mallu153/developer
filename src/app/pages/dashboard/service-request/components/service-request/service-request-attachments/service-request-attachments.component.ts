/* import { TokenStorageService } from 'app/shared/auth/token-storage.service'; */

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/shared/auth/auth.service';
import { SERVICE_FE_URL } from 'app/shared/constant-url/service-type';
import { ApiResponse } from 'app/shared/models/api-response';
import { ServiceAttachments, ServiceRequest } from 'app/shared/models/service-request';

import { FileUploadService } from 'app/shared/services/file-upload.service';
import { ServiceTypeService } from 'app/shared/services/service-type.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-service-request-attachments',
  templateUrl: './service-request-attachments.component.html',
  styleUrls: ['./service-request-attachments.component.scss'],
})
export class ServiceRequestAttachmentsComponent implements OnInit, OnDestroy {
  attachmentForm: FormGroup;
  isValidFormSubmitted: boolean = true;
  isUpload: boolean[] = [];
  @Input() srRequestData: ServiceRequest;
  @Input() serviceAttachments: ServiceAttachments[];

  private eventsSubscription: Subscription;
  @Input() events: Observable<void>;
  @Output() submittedAttachmentData = new EventEmitter<any>();
  user: any;
  constructor(
    private toastr: ToastrService,
    private fb: FormBuilder,
    private serviceTypeService: ServiceTypeService,
    private auth: AuthService,
    private fileUploadService: FileUploadService
  ) // private tokenStorage: TokenStorageService
  {}

  ngOnInit(): void {
    //this.user = this.tokenStorage.getUser();
    this.eventsSubscription = this.events.subscribe(() => this.onSubmit());
    this.initializeForm();
    if (this.serviceAttachments && this.srRequestData) {
      for (const iterator of this.serviceAttachments) {
        this.isUpload.push(false);
        this.add(iterator);
      }
    }
  }
  ngOnDestroy() {
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }
  initializeForm() {
    this.attachmentForm = this.fb.group({
      attachments: this.fb.array([], [Validators.required]),
    });
  }
  createFormGroup(srRequestId: number, attachment?: any) {
    return this.fb.group({
      additional: false,
      createdBy: this.user.userId,
      id: ['', [Validators.required]],
      fileType: attachment.fileType,
      name: attachment.name,
      srRequestId: [srRequestId, [Validators.required]],
      srAttachmentId: attachment.attachmentsId,
      status: [true, [Validators.required]],
      updatedBy: null,
      url: ['', [Validators.required]],
    });
  }
  attachments(): FormArray {
    return this.attachmentForm.get('attachments') as FormArray;
  }
  add(attachment: any) {
    this.isValidFormSubmitted = true;
    const fg = this.createFormGroup(this.srRequestData.id, attachment);
    this.attachments().push(fg);
  }
  fileUpload(event, index: number) {
    if (event.target.files && event.target.files[0]) {
      const file: File = event.target.files[0];
      const isImage: File = event.target.files[0];
      if (isImage.size > 1000000) {
        this.toastr.error('file size cannot exceed 1 mb');
        return;
      }
      if (isImage.type === this.attachments().at(index).value.fileType) {
        const current = new Date();
        const timestamp = current.getTime();
        this.isUpload[index] = true;
        this.eventsSubscription =  this.fileUploadService
          .uploadFileBasedOnType(
            file,
            this.attachments().at(index).value.srRequestId + '-' + timestamp,
            'service-request-attachments'
          )
          .subscribe(
            (res) => {
              this.attachments().at(index).patchValue({
                url: res.entityCdnUrl,
              });
              this.createOrUpdateAttachments(this.attachments().at(index).value, index);

              //this.cdr.markForCheck();
            },
            (err) => {
              this.isUpload[index] = false;
              this.toastr.error(err);
            }
          );
      } else {
        event.target.value = null;
        this.toastr.error('Please upload only required type file/image');
        return;
      }
    }
  }
  viewFile(data) {
    window.open(data, '_blank');
  }
  removeImage(index) {
    let data = { ...this.attachments().at(index).value };
    data = JSON.parse(JSON.stringify(data));
    data.status = false;
    this.attachments().at(index).patchValue({
      id: 0,
      url: '',
    });
    this.createOrUpdateAttachments(data, index, true);
  }

  createOrUpdateAttachments(data, index: number, isRemove?: boolean) {
    this.eventsSubscription =  this.serviceTypeService.create(SERVICE_FE_URL.CREATE_ATTACHMENTS, [data]).subscribe(
      (res) => {
        const result: ApiResponse = res;
        if (result.status === 200) {
          this.isUpload[index] = false;
          if (isRemove) {
            this.toastr.success('removed');
            // this.attachments().at(index).patchValue(res.data[0]);
          } else {
            this.toastr.success('uploaded');
            this.attachments().at(index).patchValue(res.data[0]);
          }

          /*  this.router.navigate(["/render/view/service/list"]); */
        } else {
          this.isUpload[index] = false;
          this.toastr.error('Something went wrong', 'Error');
        }
      },
      (err) => {
        this.isUpload[index] = false;
        this.toastr.error(err);
      }
    );
  }
  onSubmit() {
    if (this.attachmentForm.invalid) {
      this.toastr.error('Please give all required files/images');
      return;
    }

    this.submittedAttachmentData.emit(this.attachmentForm.value.attachments);
  }
}
