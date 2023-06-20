export class AgentNotification {
  chatname: string;
  id: number;
  join_at: string;
  mdlname: string;
  mid: string;
  qid: string;
  room: string;
  sr: string;
  srline: string;
  status: string;
  userid: string;
  username: string;
  usertype: string;
  createdAt: Date;
  read?: boolean = false;
  constructor() {
    this.chatname =
      this.id =
      this.join_at =
      this.mdlname =
      this.mid =
      this.qid =
      this.room =
      this.sr =
      this.srline =
      this.status =
      this.userid =
      this.username =
      this.usertype =
      this.createdAt =
        null;
  }
}
