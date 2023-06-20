
import {  ChangeDetectorRef, Component,  Input,  OnDestroy,  OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RfqApiResponse } from '../../rfq-models/rfq-api-response';
import { RfqEmailResponse } from '../../rfq-models/rfq-email';
import { RfqService } from '../../rfq-services/rfq.service';
import { pax_image_url, RFQ_EMAIL } from '../../rfq-url-constants/apiurl';

@Component({
  selector: 'app-rfq-mail-send',
  templateUrl: './rfq-mail-send.component.html',
  styleUrls: ['./rfq-mail-send.component.scss']
})
export class RfqMailSendComponent implements OnInit , OnDestroy {
  ngDestroy$ = new Subject();
  //@Input() indexNumber: number;
  @Input() toEmail: string;
  @Input() sr_id: number;

  rfqEmailForm: FormGroup;
  submitted = false;
    //files to
  isloading = false;
  file: any;
  //mulitiple file array method
  public myArrayFiles: any[] = [];
  public imageResponseArray: any = [];
  editorModel = [{
    attributes: {
      font: 'roboto'
    },
    insert: 'test'
  }]


  constructor(
    private fb:FormBuilder,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private rfqServices: RfqService,
     private cdr: ChangeDetectorRef,
     private toastr: ToastrService,
     ) {

  }

  ngOnInit() {

  this.initializeForm();
  if(this.toEmail &&this.sr_id){
    this.rfqEmailForm.patchValue({
      from:'support@travtronics.com',
      to_address:this.toEmail,
      sr_id:this.sr_id
    });
  }
  }
  ngOnDestroy(){
    this.ngDestroy$.next(true);
    this.ngDestroy$.complete();
  }
  initializeForm(){
   this.rfqEmailForm=this.fb.group({
   from:'',
   to_address:'',
   cc_address:'',
   subject:['', [Validators.required]],
   mail_body:['', [Validators.required]],
   sr_id:'',
   attachments:''
   });
  }

  get f(){
   return this.rfqEmailForm.controls;
  }
  //mulitiple file change
  onFileChange(event: any) {
    for (var i = 0; i < event.target.files.length; i++) {
      this.myArrayFiles.push(event.target.files[i]);
    }
    this.multiplefileupload();
  }
  multiplefileupload() {
    this.isloading = true;
    let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let uuid = '';
    for (let i = 0; i < 6; i++) {
      uuid += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }

    if(this.myArrayFiles.length>0){
      for (var i = 0; i < this.myArrayFiles.length; i++) {
        this.rfqServices.imageUpload(this.myArrayFiles[i], 'rfq-srid-'+this.sr_id+'-'+uuid, pax_image_url.imageposturl).pipe(takeUntil(this.ngDestroy$)).subscribe((profileResponse) => {
          if (profileResponse) {
            this.isloading = false;
            this.myArrayFiles=[];
            this.imageResponseArray.push(profileResponse?.entityCdnUrl)
          } else {
            this.isloading = false;

            this.toastr.error('image  not uploaded', "Error");
          }
          this.cdr.markForCheck();
        },
          (err) => {
            this.isloading = false;

            this.toastr.error('Oops! Something went wrong upload the image', "Error");
            this.cdr.markForCheck();
          });
      }
    }


  }

  removeMultipleFiles(i, name) {
    if (confirm(`Are sure you want to delete ${name} ?`) == true) {
      if (this.myArrayFiles.length > 0) {
        this.myArrayFiles.splice(i, 1);
      }
      if (this.imageResponseArray) {
        if (this.imageResponseArray?.length > 0) {
          this.imageResponseArray.splice(i, 1);
        }
      }
    }

  }

  onSubmitForm(){
    this.submitted = true;
    // stop here if form is invalid
    if (this.rfqEmailForm.invalid) {
      return this.toastr.error('Please fill the required fields', 'Error');
    }
    if (this.rfqEmailForm.valid) {
      const SAVE_DATA={
        toMailId:this.rfqEmailForm.value.to_address,
        ccMailId:this.rfqEmailForm.value.cc_address,
        subject:this.rfqEmailForm.value.subject,
        mailBody:this.rfqEmailForm.value.mail_body,
        srId:this.rfqEmailForm.value.sr_id,
        attachments: this.imageResponseArray,
      };
      this.rfqServices.sendRfqEmail(SAVE_DATA, RFQ_EMAIL.rfq_email).pipe(takeUntil(this.ngDestroy$)).subscribe((res) => {
        const result: RfqApiResponse = res;
        if (result.status === 200) {
          this.toastr.success(result.message, 'Success');
          this.closePopup();
          this.cdr.markForCheck();
        }else{
          this.closePopup();
          this.toastr.error(result.message, 'Error');
          this.cdr.markForCheck();
        }

      });
    }
  }

  closePopup() {
    if (this.modalService.hasOpenModals()) {
      this.modalService.dismissAll();
    }
  }
}
