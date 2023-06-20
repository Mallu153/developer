export class RfqEmailResponse {
  status: boolean;
  message: string;
}

export class RfqEmail {
  srId: number;
  toMailId: string;
  ccMailId: string;
  subject: string;
  mailBody: string;
  attachments: string[];
}
export class PaxImage {
  file?: string;
  entityCdnUrl: string;
  entityName: string;
}
