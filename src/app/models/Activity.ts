export class Activity {
    roleID: number;
    roleName: string;
    c: boolean;
    r: boolean;
    u: boolean;
    d: boolean;
    e: boolean;
    extra: boolean;
    mappingID: number;
    activityID: number;
    activityName: string;
    activityURL: string;

  
    constructor() {
      this.roleID = 0;
      this.roleName = '';
      this.c = false;
      this.r = false;
      this.u = false;
      this.d = false;
      this.e = false;
      this.extra = false;
      this.mappingID = 0;
      this.activityID = 0;
      this.activityName = '';
      this.activityURL='';
    }
  }
  