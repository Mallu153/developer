export class CalendarBookings {
  bookingCount: number;
  bookingDate: Date;
  product: CalendarProducts[];
  userId: number;
  userName: string;
  constructor() {
    this.bookingCount = this.bookingDate = this.product = this.userId = this.userName = null;
  }
}

class CalendarProducts {
  productBookingCount: number;
  productId: number;
  productName: string;
  constructor() {
    this.productBookingCount = this.productId = this.productName = null;
  }
}
