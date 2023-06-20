import { Injectable } from '@angular/core';
import { AuthService } from 'app/shared/auth/auth.service';
import { environment } from 'environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { io } from 'socket.io-client';

export class WhatsAppCount {
  action: string;
  message?: any;
  ticket?: any;
  contact?: any;
  ticketCountPending: number;
  ticketCountOpen: number;
}
@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket: any;
  private whatsupSocket: any;
  private chatUrl: string = `${environment.TT_CHAT_NODE}`;
  private whatsupSocketUrl: string = `${environment.SOCKET_ENDPOINT}`;

  constructor(private authService:AuthService) {}

  connect(username: string, callback: Function = () => {}): void {
    // initialize the connection
    this.socket = io(this.chatUrl);
    this.socket.on('error', (error) => {
      console.log('====================================');
      console.log(error);
      console.log('====================================');
    });
    this.socket.on('connect', () => {
      //  console.log('connected to the chat server');
      callback();
    });

    this.whatsupSocket = io(this.whatsupSocketUrl);
    // this.whatsAppCount();
  }

  isConnected(): boolean {
    if (this.socket != null) {
      return true;
    } else {
      return false;
    }
  }

  receiveAgentNotification(): any {
    let observable = new Observable((observer) => {
      this.socket.on('agentNotificationOnNewCustomerArrived', (data: any) => {
        observer.next(data);
      });
    });
    return observable;
  }
  isWhatsAppConnected(): boolean {
    if (this.whatsupSocket != null) {
      return true;
    } else {
      return false;
    }
  }
  whatsAppCount() {
    let observable = new Observable((observer) => {
      const waUser = {
        msg: 'A client joined angular.',
        userId:  this.authService.getWaUser(),
      };
      this.whatsupSocket.emit('my message', waUser);
      this.whatsupSocket.on('appMessageCreate', (data: WhatsAppCount) => {
        //console.log('appMessageCreate', data);
        observer.next(data);
      });
    });
    return observable;
    /*  this.whatsupSocket.on('appMessageUpdate', (data: string) => {
      console.log("appMessageUpdate",data);
      this.toastr.success('Message Update');
    }); */
  }
}
