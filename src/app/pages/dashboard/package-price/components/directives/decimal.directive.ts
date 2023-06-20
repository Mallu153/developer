import { Input, Directive, HostListener, OnChanges, ElementRef, Renderer2, EventEmitter } from "@angular/core";
import { DecimalPipe } from "@angular/common";


@Directive({
    selector: '[decimalPipe]'
})

export class DecimalDirective implements OnChanges {
    @Input() chartsReady: EventEmitter<string>;

    @Input() precision: number = 2;
    @Input() regex: RegExp = null;
    @Input() pipeExp: string = `1.${this.precision}-${this.precision}`;

    constructor(
        protected _renderer2: Renderer2,

    ) {

     }

     ngOnChanges() {
       //console.log(this.chartsReady.closed);
       if(this.chartsReady.closed)
        this.chartsReady.subscribe(res => console.log("hello", this.chartsReady));
       ;
     }

    @HostListener('focusout', ['$event'])
    protected onBlur(event: any) {
      //event: FocusEvent
        const val = event.target.value;
        //console.log(val);
        if (this.regex && !this.regex.test(val)) {
            this._renderer2.setProperty(event.target, 'value', null);
        }
        else {
            this.transformValue(event.target, val);
        }
    }

    protected transformValue(target: any, value: any): void {
        try {
            const pipe = new DecimalPipe('en');
            const formatted = pipe.transform(value, this.pipeExp).replace(/,/g, '');
            this._renderer2.setProperty(target, 'value', formatted);
            //this._el.nativeElement.value = formatted;
        }
        catch (err) {
            this._renderer2.setProperty(target, 'value', null);
            //this._el.nativeElement.value = null;
        }
    }

}
