import { Injectable, Renderer2, Inject, inject, WritableSignal, signal, Signal, computed } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../account/auth.service';
import moment from 'moment';
import * as XLSX from 'xlsx';
@Injectable({
  providedIn: 'root',
})
export class CommonService {
  isCollapsed = signal<boolean>(false);
  filtersExpanded = signal(false);
  showAlert = signal(false);
  isDropdownOpen = signal(false);
  alertType = signal<'success' | 'error' | 'warning' | 'info'>('info');
  alertMessage = signal('');
  router=inject(Router)
  gridHeight: string;
  styleValue!: string;
  constructor
  (
    private http: HttpClient,
   public authService :AuthService,
   @Inject('BASE_URL') base: string

  ) {
   
    this.gridHeight = window.innerHeight - 245 + 'px'; //228

   }


   getProfilePic(ProfilePic: string ,Gender:string){
    if (ProfilePic && ProfilePic.trim() !== '') {
      return `data:image/jpeg;base64,${ProfilePic}`;
    }
    return Gender?.toLowerCase() === 'm' 
      ? 'assets/images/man.png' 
      : 'assets/images/woman.png';
  }
  

 
   
  showCustomAlert(showAlert: boolean, type: 'success' | 'error' | 'warning' | 'info', message: string) {
    this.showAlert.set(showAlert);
    this.alertType.set(type);
    this.alertMessage.set(message);
  }
  hideAlert() {
    this.showAlert.set(false);
  }


  setDisplayedColumns(columns: any, displayedColumns: any) {
    columns.forEach((column: { index: any; field: any; }, index: string | number) => {
      column.index = index;
      displayedColumns[index] = column.field;
    });
  }
  processKeys(data: any[]): any[] {
    return data.map(item => {
      const processedItem: any = {};
      for (const key of Object.keys(item)) {
        // Remove underscores and numbers, convert to title case
        const newKey = this.convertToTitleCase(key.replace(/[_0-9]+/g, ' '));
        processedItem[newKey] = item[key];
      }
      return processedItem;
    });
  }
toggleExpanded(){
  this.filtersExpanded.set(!this.filtersExpanded());
}
  toggleSidebar() {
    this.isCollapsed.set(!this.isCollapsed()); // Toggle the state
  }

  setSidebarState(state: boolean) {
    this.isCollapsed.set(state); // Explicitly set state
  }
  toggleDropdown() {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  closeDropdown() {
    this.isDropdownOpen.set(false);
  }
 Tablewidth= computed(() => {
    const screenWidth = window.innerWidth;
    
    if (screenWidth >= 1536) {
      return this.isCollapsed() ? 'w-[94vw]' : 'w-[81.5vw]';
    } else if (screenWidth >= 1280) {
      return this.isCollapsed() ? 'w-[96vw]' : 'w-[83vw]';
    } else if (screenWidth >= 1024) {
      return this.isCollapsed() ? 'w-[98vw]' : 'w-[85vw]';
    } else {
      return this.isCollapsed() ? 'w-full' : 'w-[90vw]'; // Mobile fallback
    }
  });
// Computed signal for the div height
TableHeight = computed(() => {
  const screenHeight = window.innerHeight;

  if (this.filtersExpanded()) {
    // When filters are expanded:
    if (screenHeight < 768) {
      // For small screens (e.g. your 730px screen)
      return '322px';
    } else if (screenHeight < 900) {
      // For medium screens
      return '322px';
    } else {
      // For large screens
      return '351px';
    }
  } else {
    // When filters are NOT expanded, use a dynamic calc formula.
    if (screenHeight < 768) {
      // For small screens (e.g. your 730px screen, 100vh equals 730px)
      // Using calc(100vh - 238px) gives: 730 - 238 = 492px.
      return 'calc(100vh - 238px)';
    } else if (screenHeight < 900) {
      return 'calc(100vh - 250px)';
    } else {
      return 'calc(100vh - 270px)';
    }
  }
});
  
  // Helper function to convert a string to title case
  private convertToTitleCase(str: string): string {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  // convertKeyToHeader(key: string): string {
  //   // Example implementation: Capitalize and replace underscores with spaces
  //   return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  // }
  convertKeyToHeader(key: string): string {
    // Replace underscores with spaces
    let cleanedKey = key.replace(/_/g, ' ');

    // Convert each word to title case (first letter uppercase, rest lowercase)
    return cleanedKey.split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }


 
 
  dateFormatter(params: any):any {
    if (params.value) {
      return moment(params.value).format('DD/MM/YYYY hh:mm:ss A');
    }
  }

  dateFormat(params: any) {
    if (params) {
      return moment(params).format('DD/MM/YYYY hh:mm:ss A');
    } else {
      return '-';
    }
  }
 
  pageValidate() {
    const url= this.router.url;
    
    let activity: any;
    const actvalue = localStorage.getItem('flatactivity')?.toString();
    const activities = JSON.parse(actvalue == undefined ? '' : actvalue);
    if (activities) {
      activities.forEach((act: any, index: any) => {
        if (act.activitY_URL === url.replace('/home/', '')) {
          activity = act;
        }
      });
    }
    if (activity === undefined) {
      this.router.navigateByUrl('/home/user-management/notfound');
    }
    return activity;
  }
  
  // Corrected formatColumnName function
  formatColumnName(column: string): { key: string; title: string; width: string } {
    const match = column.match(/_(\d+)$/); // Extract width if present
    const width = match ? `${match[1]}px` : '200px'; // Assign width if found, else default 200px
    const key = column.replace(/_\d+$/, ''); // Remove trailing number and underscore
    const title = key.replace(/_/g, ' ') // Replace underscores with spaces
      .trim() // Remove any extra spaces
      .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize words
    
    return { key, title, width };
  }

  TimeMatFormatter(params: any) {
    if (params) {
      // Check if the input is a time-only string (HH:mm:ss)
      if (/^\d{2}:\d{2}:\d{2}$/.test(params)) {
        return moment(`1970-01-01 ${params}`, "YYYY-MM-DD HH:mm:ss").format("hh:mm:ss A");
      }
      // Existing logic for date-time formatting
      return moment(params).format("hh:mm:ss A");
    } else {
      return "-";
    }
  }
  
  dateMatFormatter(params: any) {
    if (params) {
           return moment(params).format('DD/MM/YYYY');
  
     // return moment(params).format('DD/MM/YYYY hh:mm:ss A');
  
    } else {
      return '-';
    }
  }

  DateandTimeMatFormatter(params: any) {
    if (params) {
      return moment(params).format('DD/MM/YYYY hh:mm:ss A');
    } else {
      return '-';
    }
  }
  getStyle() {
    
    var screen = window.innerWidth;
    var activities = JSON.parse(this.authService.getActivity());
    if (screen < 1440 && activities.length < 7) {
      this.styleValue = "right: 0;position: absolute;";
    } else if (screen < 1440 && activities.length > 7) {
      this.styleValue = "right: 0;";
    } else {
      this.styleValue = "right: 0; position: absolute;";
    }
    return this.styleValue;
  }
  SimpleDateFormate(params: any) {
    if (params) {
      return moment(params).format('DD/MM/YYYY');
    } else {
      return '-';
    }
  }
  exportToExcelWithStatus(columns: any, rows: any, fileName: string) {
    
    const xlsHeader = columns.filter((x: { hide: boolean; columnDef: string; }) => x.hide !== true && x.columnDef !== 'action'
      && x.columnDef !== 'reset' && x.columnDef !== 'viewPlan' && x.columnDef !== 'delete');
    const createXLSLFormatObj = [];
 
 
    createXLSLFormatObj.push(xlsHeader.map((x: { header: any; })  => x.header));
    rows.data.forEach((item: any, index: any) => {
      const innerRow = [];
      for (const col of xlsHeader) {
        innerRow.push(item[col.columnDef]);
      }
      createXLSLFormatObj.push(innerRow);
    });
    console.log(createXLSLFormatObj);
    const wb = XLSX.utils.book_new(),
      ws = XLSX.utils.aoa_to_sheet(createXLSLFormatObj);
    XLSX.utils.book_append_sheet(wb, ws, fileName);
    XLSX.writeFile(wb, fileName);
  }
  exportToExcel(columns: any, rows: any, fileName: string) {
    
    const xlsHeader = columns.filter((x: { hide: boolean; columnDef: string; }) =>
        x.hide !== true &&
        !['action', 'reset', 'viewPlan', 'delete'].includes(x.columnDef)
    );

    const createXLSLFormatObj: any[] = [];

    // Add headers
    createXLSLFormatObj.push(xlsHeader.map((x: { header: any; }) => x.header));

    // Add rows, transform status to readable format
    rows.data.forEach((item: any) => {
        const innerRow: any[] = [];
        for (const col of xlsHeader) {
            let cellValue = item[col.columnDef];

            // Transform the status value
            if (col.columnDef === 'status') {
                switch (item.status) {
                    case 1:
                        cellValue = 'Approved';
                        break;
                    case 2:
                        cellValue = 'Rejected';
                        break;
                    case 0:
                        // Assuming you want "Approve/Reject" for status 0
                        cellValue = 'Approve/Reject';
                        break;
                    default:
                        cellValue = 'Unknown'; // Optional: Handle any unexpected status
                }
            }

            // Check if the value is too long and truncate
            if (typeof cellValue === 'string' && cellValue.length > 32767) {
                cellValue = cellValue.substring(0, 32767); // Truncate to 32,767 characters
            }
            innerRow.push(cellValue);
        }
        createXLSLFormatObj.push(innerRow);
    });

    console.log(createXLSLFormatObj);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(createXLSLFormatObj);

    XLSX.utils.book_append_sheet(wb, ws, fileName);
    XLSX.writeFile(wb, fileName);
}

  
  checkForNull(params: any) {
    return params === 'null' ? '-' : params;
  }

  popupSettings(width?: string, height?: string) {
    
    const dialogCongig = new MatDialogConfig();
    dialogCongig.disableClose = true;
    dialogCongig.autoFocus = true;
    dialogCongig.width = !!width === false ? '40%' : width;
    return dialogCongig;
  }
}



export const regExps: { [key: string]: RegExp } = {
  password: /^(?=.*?[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/,
  msisdn: /^(03)([0-9]{9})$/,
  amount: /^([1-9][0-9]*)$/,
  cnic: /[0-9]{13}$/,
  alphabets: /^[a-zA-Z \-\']+/,

  //////OS Change Set  
  agentUserID: /[0-9]{4}$/,
  agentPin: /[0-9]{4}$/,
  otp: /[0-9]{4}$/,
  franchiseID: /[0-9]{4}$/,

  email: /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
  refrenceNo: /[a-zA-Z0-9]{14,24}$/,
  ibanno: /[a-zA-Z0-9]{11,24}$/,
  ntn: /[a-zA-Z0-9]{7,19}$/,
  businessNamePattern: /[a-zA-Z0-9.,()!?:/+*=@'_ -]*/,
  forbiddenchars: /^[^#&$]+$/

  //ibanno: /^(?:[A-Za-z0-9]{5}|[A-Za-z0-9]{9})$/,


};




