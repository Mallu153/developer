import { Component, Input, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-get-sr-mail-box',
  templateUrl: './get-sr-mail-box.component.html',
  styleUrls: ['./get-sr-mail-box.component.scss'],
})
export class GetSrMailBoxComponent implements OnInit {
  @Input() srId: string;
  url: string = 'http://192.178.10.122/tt-email/mailbox/mailbox/get_sr_mailbox/';

  safeUrl: any;
  constructor(public activeModal: NgbActiveModal, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    if (this.srId) {
      this.url = this.url + this.srId;
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
      // this.safeUrl = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.sanitizer.bypassSecurityTrustResourceUrl(this.url));
    }
  }
}
