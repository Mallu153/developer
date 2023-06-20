import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MicroAccontResponse } from 'app/shared/models/micro-account-response';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-micro-account-view',
  templateUrl: './micro-account-view.component.html',
  styleUrls: ['./micro-account-view.component.scss']
})
export class MicroAccountViewComponent implements OnInit , OnDestroy {
  @Input() micro_accountData: MicroAccontResponse;
  view_type_str : string;
  private ngUnSubscribe: Subject<void>;
  constructor(
    private route: ActivatedRoute
  ) { }


  trackByFn(index, item) {
    return index;
  }
  ngOnInit(): void {
    this.ngUnSubscribe = new Subject<void>();
    this.route.queryParams.pipe(takeUntil(this.ngUnSubscribe)).subscribe((param) => {
      if (param && param.view_type) {
          this.view_type_str = param.view_type;
      }
    });

  }

  ngOnDestroy(): void {
    this.ngUnSubscribe.next();
    this.ngUnSubscribe.complete();
  }

}
