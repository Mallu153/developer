import { AuthService } from 'app/shared/auth/auth.service';
import { Directive, Input, ElementRef, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appButtonAccess]'
})
export class ButtonAccessDirective implements OnInit {
  @Input('appButtonAccess') buttonKey!: string;
  constructor(
    private el: ElementRef<HTMLButtonElement>,
    private auth: AuthService,

  ) { }

  ngOnInit(): void {
    const KEYS = this.auth.getPageKeys();

    if(KEYS) {
      if(!KEYS?.includes(this.buttonKey)) {

        this.el.nativeElement.style.display = 'none';
      }
    } else {
      this.el.nativeElement.style.display = 'none';
    }
  }

}
