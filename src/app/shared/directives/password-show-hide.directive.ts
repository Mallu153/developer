import { Directive, ElementRef, Renderer2  } from '@angular/core';

@Directive({
  selector: '[appPasswordShowHide]'
})
export class PasswordShowHideDirective {
isVisible: boolean = false;
  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.createIcon();
  }

   createIcon() {
    const input = this.el.nativeElement.parentNode;
    const span = document.createElement('span');
    span.innerHTML = `Show`;
    this.renderer.addClass(span, 'customcss')
    span.addEventListener('click', (event) => {
      this.toggle(span);
    });
    input.appendChild(span);
  }

toggle(span) {
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.renderer.setAttribute(this.el.nativeElement,'type', 'text');

      span.innerHTML = 'Hide';
    } else {
      this.renderer.setAttribute(this.el.nativeElement,'type', 'password');
      span.innerHTML = 'Show';

    }
  }
}
