export interface MenuReponse {
  name: string;
  link: number;
  path: string;
  applicationId: number;
  url: string;
  icon: string;
  badage: string;
  badageClass: string;
  externalLink: boolean;
  newTab: boolean;
  collapse: boolean;
  group: Group;
}

interface Group {
  lines: MenuReponse[];
}
