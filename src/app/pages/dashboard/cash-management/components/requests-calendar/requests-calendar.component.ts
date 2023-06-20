import { Component, ChangeDetectionStrategy, ViewChild, TemplateRef, OnInit, ChangeDetectorRef } from '@angular/core';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours } from 'date-fns';
import { Observable, Subject, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { CashManagementService } from '../../services/cash-management.service';
import { AuthService } from 'app/shared/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CalendarBookings } from '../../models/calendar-bookings';
import { products } from 'app/shared/data/products';
import { Router } from '@angular/router';
import { EncrDecrServiceService } from 'app/shared/services/encr-decr-service.service';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'app-requests-calendar',
  templateUrl: './requests-calendar.component.html',
  styleUrls: ['./requests-calendar.component.scss'],
})
export class RequestsCalendarComponent implements OnInit {
  @ViewChild('modalContent') modalContent: TemplateRef<any>;

  view: string = 'month';

  newEvent: CalendarEvent;

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        // this.handleEvent('Edit this event', event);
      },
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        /*  this.events = this.events.filter((iEvent) => iEvent !== event);
          this.handleEvent('This event is deleted!', event); */
      },
    },
  ];

  refresh: Subject<any> = new Subject();
  activeDayIsOpen: boolean = false;
  private userId: number;
  bookings$: Observable<CalendarEvent<CalendarBookings>[]>;
  public products = products;
  constructor(
    private modal: NgbModal,
    private  router: Router,
    private storeManagementService: CashManagementService,
    private authService: AuthService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private EncrDecr:EncrDecrServiceService
  ) {
    this.userId = this.authService.getUser();
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    // Retrieve an array from Local Storage
    const currentDate = new Date(this.viewDate);
    const myArrayString = localStorage.getItem(
      `bookings-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}-${this.userId}`
    );
    // Convert the JSON string back to an array of objects

    if(myArrayString){
      const decryptData=this.EncrDecr.decryptUsingAES256(myArrayString);
      const myArray = JSON.parse(decryptData);
      if (myArray?.length > 0) {
        let bookings: any = [];
        myArray?.forEach((booking) => {
          bookings.push({
            start: startOfDay(new Date(booking?.referenceDate)),
            end: endOfDay(new Date(booking?.referenceDate)),
            meta: booking,
          });
        });
        this.bookings$ = of(bookings);
      }
    }else {
      this.getBookings();
    }


  }

  /**
   * method to get bookings based on clicked date
   *
   * @memberof RequestsCalendarComponent
   */
  public getBookings(actionType?:string): void {
    // Retrieve an array from Local Storage
    const currentDate = new Date(this.viewDate);
    const myArrayString = localStorage.getItem(
      `bookings-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}-${this.userId}`
    );
    // Convert the JSON string back to an array of objects
    let myArray:any;
    if(actionType==='refreshApi'){
      this.loadBookingData();
    }else if(myArrayString){
      const decryptData=this.EncrDecr.decryptUsingAES256(myArrayString);
       myArray = JSON.parse(decryptData);
       let bookings: any = [];
      myArray?.forEach((booking) => {
        bookings.push({
          start: startOfDay(new Date(booking?.referenceDate)),
          end: endOfDay(new Date(booking?.referenceDate)),
          meta: booking,
        });
      });
      this.bookings$ = of(bookings);
    } else{
      this.loadBookingData();
    }

  }



  loadBookingData(){
    this.bookings$ = of(null);
    const currentDate = new Date(this.viewDate);
    this.storeManagementService
      .getCurrentMonthBookings(currentDate.getMonth() + 1, currentDate.getFullYear(), this.userId)
      .subscribe(
        (res) => {
          if (res.status === 200) {
            localStorage.setItem(
              `bookings-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}-${this.userId}`,

              this.EncrDecr.encryptUsingAES256(res?.data)
            );
            let bookings: any = [];
            res?.data?.forEach((booking) => {
              bookings.push({
                //title: 'Booking Details',
                start: startOfDay(new Date(booking?.referenceDate)),
                end: endOfDay(new Date(booking?.referenceDate)),
                // color: colors.red,
                //draggable: true,
                /* resizable: {
                beforeStart: true,
                afterEnd: true,
              },
              actions: this.actions, */
                meta: booking,
              });
            });
            this.bookings$ = of(bookings);
            this.cd.markForCheck();
          } else {
            this.bookings$ = of([]);
            this.toastr.error(res?.message);
          }
        },
        () => {
          this.bookings$ = of([]);
          this.toastr.error('Error occurred while getting bookings for calender view');
        }
      );
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    }
  }

  eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    if (event.meta.bookingDate && event.meta.userId) {
      this.router.navigate(['/dashboard/reports/booking/view'], {
        queryParams: { date_of_journey: event.meta.bookingDate, booking_user: event.meta.userId },
      });
    }

    //this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    this.newEvent = {
      title: 'New event',
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
      color: colors.red,
      draggable: true,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      actions: this.actions,
    };
    //  this.events.push(this.newEvent);

    // this.refresh.next();
    this.handleEvent('Add new event', this.newEvent);
    this.refresh.next();
  }

  bookingView(actionType: string, productName: string, productNo: number, userId: number, selectedDate: string) {
    if (productNo && userId && selectedDate) {
      this.router.navigate(['/dashboard/reports/booking/view'], {
        queryParams: {
          booking_product_name: productName,
          booking_product_no: productNo,
          date_of_journey: selectedDate,
          booking_user: userId,
          issused: actionType,
        },
      });
    }
  }


  trackByFn(index, item) {
    return index;
  }

}
