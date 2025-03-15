import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AttendanceService } from '../../services/attendance.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { MaterialModule } from '../../../../shared/material module/material.module';
import { AttendanceRecord, AttendanceRequest } from '../../../../models/AttendanceRequest';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import moment from 'moment';
import FileSaver, { saveAs } from 'file-saver';
import "jspdf-autotable";
import { FaceRecognitionComponent } from '../face-recognition/face-recognition.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule,MaterialModule, FormsModule, ReactiveFormsModule,PaginationComponent],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css'
})
export class AttendanceComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | any;
  @ViewChild(MatSort, { static: false }) sort: MatSort | any;
  displayedColumns: string[] = [];
  columns: any[] = [];
  dataSource = new MatTableDataSource<any>();
  totalPages = 1;
  currentPage = 1;
  showCustomDates = false;
  tableColumns: { key: string; title: string; width?: string }[] = [];
  attendanceList: AttendanceRecord[] = [];
  loading = false;
  dropdownOpen: string | null = null;
  isCollapsed: boolean = false; // Track collapsed state
  filtersExpanded = true;
  selectedDesignation: any = null;
  selectedDepartment: any = null;
  attendanceRequest: AttendanceRequest = {
    employeeId: 0,   // ❌ Should be undefined initially if optional
    departmentId: 0,  // ❌
    designationId: 0, // ❌
    shiftId: 0,       // ❌
    status: '',
    fromDate: '',
    toDate: '',
    dateRange: 'currentMonth',
    pageNumber: 1,
    pageSize: 25
  };
  

  //designations: string[] = ['Manager', 'Software Engineer', 'HR', 'Admin', 'Technician'];
  //departments: string[] = ['IT', 'HR', 'Finance', 'Operations', 'Marketing'];
  //shifts: string[] = ['Morning', 'Evening', 'Night'];

  departments: { id: number; name: string }[] = [
    { id: 1, name: 'IT' },
    { id: 2, name: 'HR' },
    { id: 3, name: 'Finance' }
  ];
  getRecordValue(record: AttendanceRecord, column: string): any {
    return record[column as keyof AttendanceRecord];
  }
  
  
  // ✅ Add toggleDropdown method
  toggleDropdown(type: string) {
    this.dropdownOpen = this.dropdownOpen === type ? null : type;
  }

  // ✅ Add selectDesignation method
  selectDesignation(designation: any) {
    this.selectedDesignation = designation;
    this.dropdownOpen = null;
  }

  // ✅ Add selectDepartment method
  selectDepartment(department: any) {
    this.selectedDepartment = department;
    this.dropdownOpen = null;
  }


  shifts: { id: number; name: string }[] = [
    { id: 1, name: 'Morning Shift' },
    { id: 2, name: 'Evening Shift' },
    { id: 3, name: 'Night Shift' }
  ];
  designations: { id: number; name: string }[] = [
    { id: 1, name: 'Manager' },
    { id: 2, name: 'Software Engineer' },
    { id: 3, name: 'HR' },
    { id: 4, name: 'Admin' },
    { id: 5, name: 'Technician' }
  ];
  
  dateRanges = [
    { value: 'currentMonth', label: 'Current Month' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'yearToDate', label: 'Year to Date' },
    { value: 'custom', label: 'Custom Range' }
  ];


  constructor(private attendanceService: AttendanceService,private dialog: MatDialog) {}

  ngOnInit() {
    this.setDateRange();
    this.getAttendance();
  }

  setDateRange() {
    const today = new Date();
    let fromDate: Date;
    let toDate: Date;

    switch (this.attendanceRequest.dateRange) {
      case 'currentMonth':
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        this.showCustomDates = false;
        break;
      case 'last3Months':
        fromDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        toDate = today;
        this.showCustomDates = false;
        break;
      case 'yearToDate':
        fromDate = new Date(today.getFullYear(), 0, 1);
        toDate = today;
        this.showCustomDates = false;
        break;
      case 'custom':
        this.showCustomDates = true;
        return; // Don't set default dates for custom
      default:
        return;
    }

    this.attendanceRequest.fromDate = fromDate.toISOString().split('T')[0];
    this.attendanceRequest.toDate = toDate.toISOString().split('T')[0];
  }

  
  getAttendance() {
    this.loading = true;
    this.attendanceService.getAttendance(this.attendanceRequest).subscribe(
      (response: any) => {
        if (response.resp?.code === '00' && response.attendanceData.length > 0) {
          this.totalPages=response.resp.totalPages;
          const attendanceData = response.attendanceData || [];
          const excludedColumns = ['AttendanceID', 'EmployeeID','DateOfBirth', 'Gender'];
  
          // Step 1: Process column names and store mapping
          const columnMapping: { [originalKey: string]: string } = {};
  
          this.columns = Object.keys(attendanceData[0] || {})
            .filter(column => !excludedColumns.includes(column))
            .map(column => {
              const formattedColumn = this.formatColumnName(column);
              columnMapping[column] = formattedColumn.key; // Store mapping of old key to new key
              return formattedColumn;
            });
  
          // Ensure 'actions' column is added only once
          if (!this.columns.some(col => col.key === 'actions')) {
            this.columns.splice(1, 0, { key: 'actions', title: 'Actions', width: '70px' });
          }
  
          this.displayedColumns = this.columns.map(col => col.key);
  
          // Step 2: Transform the row data to match new keys
          const transformedData = attendanceData.map((record: any) => {
            const newRecord: any = {};
  
            Object.keys(record).forEach((originalKey) => {
              const newKey = columnMapping[originalKey] || originalKey; // Use formatted key if available
              newRecord[newKey] = record[originalKey];
            });
  
            // Step 3: Format specific fields (using new keys)
            if (newRecord.Attendance_Date) {
              newRecord.Attendance_Date = this.dateMatFormatter(newRecord.Attendance_Date);
            }
            if (newRecord.DateOfBirth) {
              newRecord.DateOfBirth = this.dateMatFormatter(newRecord.DateOfBirth);
            }
            if (newRecord.CheckIn) {
              newRecord.CheckIn = this.TimeMatFormatter(newRecord.CheckIn);
            }
            if (newRecord.CheckOut) {
              newRecord.CheckOut = this.TimeMatFormatter(newRecord.CheckOut);
            }
  
            return newRecord;
          });
           console.log(transformedData)
          this.dataSource = new MatTableDataSource(transformedData);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
        this.loading = false;
      },
      (error: any) => {
        console.error('Error fetching attendance:', error);
        this.loading = false;
      }
    );
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
      return moment(params).format(' hh:mm:ss A');
     // return moment(params).format('DD/MM/YYYY hh:mm:ss A');

    } else {
      return '-';
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

  
  
  onEditAttendance(record: AttendanceRecord) {
    console.log('Edit attendance record:', record);
    // Logic to open modal and pass the selected record for editing
  }

  exportAttendance(format: string) {
    let fileName = `attendance.${format}`;
  
    if (format === 'csv') {
      const csvData = this.convertToCSV(this.attendanceList);
      const blob = new Blob([csvData], { type: 'text/csv' });
      saveAs(blob, fileName); // ✅ Corrected to avoid redundant Blob creation
    } else if (format === 'excel') {
      import('xlsx').then(xlsx => {
        const worksheet = xlsx.utils.json_to_sheet(this.attendanceList);
        const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
        const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(data);
        link.download = fileName;
        link.click();
      }); // ✅ Added missing closing parenthesis
    }
  }
  
  exportData() {
    if (!this.attendanceList || this.attendanceList.length === 0) {
      return;
    }
  
    const jsonData = JSON.stringify(this.attendanceList, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    FileSaver.saveAs(blob, `AttendanceRecords_${new Date().toISOString()}.json`);
  }
  
  private convertToCSV(data: any[]): string {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  }
  
  openFaceRecognitionDialog() {
    const dialogRef = this.dialog.open(FaceRecognitionComponent, {
      width: '600px', // Adjust according to your model
      height: '600px', // Adjust according to your model
      maxWidth: '90vw', // Ensures compatibility with smaller screens
      maxHeight: '90vh',
      disableClose: false,
      data: { employeeId: this.attendanceRequest?.employeeId } 
    });
  
    dialogRef.afterClosed().subscribe(result => {
      this.getAttendance();
  
      if (result) {
        this.getAttendance();
      }
    });
  }
  
  
  onPageChange(event: { pageIndex: number, pageSize: number }): void {
    debugger
    this.attendanceRequest.pageNumber = event.pageIndex; // Already 0-based
    this.attendanceRequest.pageSize = event.pageSize;
    if(this.attendanceRequest.pageNumber==0){
      this.attendanceRequest.pageNumber =1;
    }
    this.getAttendance();
  }
  
}
