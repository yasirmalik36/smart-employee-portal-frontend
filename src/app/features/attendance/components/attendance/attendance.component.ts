import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AttendanceService } from '../../services/attendance.service';
import { MaterialModule } from '../../../../shared/material module/material.module';
import { AttendanceRecord, AttendanceRequest } from '../../../../models/AttendanceRequest';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import moment from 'moment';
import FileSaver, { saveAs } from 'file-saver';
import "jspdf-autotable";
import * as XLSX from 'xlsx';
import { FaceRecognitionComponent } from '../face-recognition/face-recognition.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from '../../../../common/services/common.service';
import { AlertBoxComponent } from '../../../../shared/components/alert-box/alert-box.component';
import { ManualAttendanceComponent } from '../manual-attendance/manual-attendance.component';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule,MaterialModule, FormsModule, ReactiveFormsModule,AlertBoxComponent],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css'
})
export class AttendanceComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator ;
  @ViewChild(MatSort, { static: false }) sort!: MatSort ;
  public common = inject(CommonService);
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
  selectedDesignation: any = null;
  selectedDepartment: any = null;
  selectedempID: any = null;
  selectedShift: any = null;
  attendanceData: any;
  tableWidth = this.common.Tablewidth;
  TableHeight = this.common.TableHeight;


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
  
  departments: { id: number; name: string }[] = [
    { id: 1, name: 'IT' },
    { id: 2, name: 'HR' },
    { id: 3, name: 'Finance' }
  ];
  shifts: { id: number; name: string }[] = [
    { id: 1, name: 'Morning Shift' },
    { id: 2, name: 'Evening Shift' },
    { id: 3, name: 'Night Shift' }
  ];
  designations: { id: number; name: string }[] = [
    { id: 1, name: 'Software Engineer' },
    { id: 2, name: 'Senior Software Engineer' },
    { id: 3, name: 'HR' },
    { id: 4, name: 'Admin' },
    { id: 5, name: 'Technician' }
  ];
  
  dateRanges = [
    { value: 'currentMonth', label: 'Current Month' },
    { value: 'lastMonth', label: 'Last Month' }, // ✅ Added Last Month
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'yearToDate', label: 'Year to Date' },
    { value: 'lastYear', label: 'Last Year' }, // ✅ Added Last Year
    { value: 'custom', label: 'Custom Range' }
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


  selectShift(shift: any) {
    this.selectedShift = shift;
    this.attendanceRequest.shiftId = shift ? shift.id : null; // Update model
    this.dropdownOpen = null; // Close dropdown
  }
  private attendanceService = inject(AttendanceService);
  constructor(private dialog: MatDialog) {

  }

  ngOnInit() {
    this.totalPages = 0; // Set default value
    this.attendanceRequest.pageNumber = 1;
    this.attendanceRequest.pageSize = 25;
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
      case 'lastMonth':
        fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        toDate = new Date(today.getFullYear(), today.getMonth(), 0);
        this.showCustomDates = false;
        break;
      case 'last3Months':
        fromDate = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        this.showCustomDates = false;
        break;
      case 'yearToDate':
        fromDate = new Date(today.getFullYear(), 0, 1);
        toDate = today;
        this.showCustomDates = false;
        break;
      case 'lastYear':
        fromDate = new Date(today.getFullYear() - 1, 0, 1);
        toDate = new Date(today.getFullYear() - 1, 11, 31);
        this.showCustomDates = false;
        break;
      case 'custom':
        fromDate = new Date(today); // ✅ Assign today's date
        toDate = new Date(today);   // ✅ Assign today's date
        this.showCustomDates = true;
        break;
      default:
        return;
    }
  
    this.attendanceRequest.fromDate = fromDate.toISOString().split('T')[0];
    this.attendanceRequest.toDate = toDate.toISOString().split('T')[0];
  }
  
  
  searchAttendance() {
    this.attendanceRequest.employeeId = this.selectedempID || 0;
    this.attendanceRequest.departmentId = this.selectedDepartment?.id || 0;
    this.attendanceRequest.designationId = this.selectedDesignation?.id || 0;
    this.attendanceRequest.shiftId = this.attendanceRequest.shiftId || 0;
    this.attendanceRequest.fromDate = this.attendanceRequest.fromDate || '';
    this.attendanceRequest.toDate = this.attendanceRequest.toDate || '';
    this.attendanceRequest.status = this.attendanceRequest.status || '';
    this.common.filtersExpanded.set(false);

    // Validation: Check if the custom date range is selected but dates are missing
    if (this.attendanceRequest.dateRange === 'custom' && (!this.attendanceRequest.fromDate || !this.attendanceRequest.toDate)) {
      this.common.showCustomAlert(true, 'warning', 'Please select both From and To dates for a custom date range.');
      return;
    }
  
    // Validation: Ensure the "From Date" is not after "To Date"
    if (new Date(this.attendanceRequest.fromDate) > new Date(this.attendanceRequest.toDate)) {
      this.common.showCustomAlert(true, 'error', 'From Date cannot be after To Date.');
      return;
    }
  
    // Validation: Ensure at least one filter is applied
    if (
      !this.attendanceRequest.employeeId &&!this.attendanceRequest.departmentId &&!this.attendanceRequest.designationId &&!this.attendanceRequest.shiftId &&
      !this.attendanceRequest.status && !this.attendanceRequest.fromDate &&!this.attendanceRequest.toDate
    ) {
      this.common.showCustomAlert(true, 'info', 'Please select at least one filter before searching.');
      return;
    }
  
    this.getAttendance();
  }
  
  getAttendance() {
    this.loading = true;
    this.attendanceService.getAttendance(this.attendanceRequest).subscribe(
      (response: any) => {
        if (response.resp?.code === '00') {
          debugger
          this.totalPages=response.resp.totalPages;
           this.attendanceData = response.attendanceData || [];
           this.attendanceList=response.attendanceData || [];
           if (this.attendanceData.length === 0) {
            this.common.showCustomAlert(true, 'info', 'No attendance records found for the selected filters.');
        }
          const excludedColumns = ['AttendanceID', 'EmployeeID','DateOfBirth', 'Gender'];
          
          // Step 1: Process column names and store mapping
          const columnMapping: { [originalKey: string]: string } = {};
  
          this.columns = Object.keys(this.attendanceData[0] || {})
            .filter(column => !excludedColumns.includes(column))
            .map(column => {
              const formattedColumn = this.common.formatColumnName(column);
              columnMapping[column] = formattedColumn.key; // Store mapping of old key to new key
              return formattedColumn;
            });
  
          // Ensure 'actions' column is added only once
          if (!this.columns.some(col => col.key === 'actions')) {
            this.columns.splice(1, 0, { key: 'actions', title: 'Action', width: '75px' });
          }
  
          this.displayedColumns = this.columns.map(col => col.key);
  
          // Step 2: Transform the row data to match new keys
          const transformedData = this.attendanceData.map((record: any) => {
            const newRecord: any = {};
  
            Object.keys(record).forEach((originalKey) => {
              const newKey = columnMapping[originalKey] || originalKey; // Use formatted key if available
              newRecord[newKey] = record[originalKey];
            });
  
            // Step 3: Format specific fields (using new keys)
            if (newRecord.Attendance_Date) {
              newRecord.Attendance_Date = this.common.dateMatFormatter(newRecord.Attendance_Date);
            }
            if (newRecord.DateOfBirth) {
              newRecord.DateOfBirth = this.common.dateMatFormatter(newRecord.DateOfBirth);
            }
            if (newRecord.CheckIn) {
              newRecord.CheckIn = this.common.TimeMatFormatter(newRecord.CheckIn);
            }
            if (newRecord.CheckOut) {
              newRecord.CheckOut = this.common.TimeMatFormatter(newRecord.CheckOut);
            }
  
            return newRecord;
          });
          this.dataSource = new MatTableDataSource(transformedData);
          setTimeout(() => {
            if (this.paginator) {
              this.dataSource.paginator = this.paginator;
            }
            if (this.sort) {
              this.dataSource.sort = this.sort;
            }
          });
        }
        this.loading = false;
      },
      (error: any) => {
        this.common.showCustomAlert(true, 'error', 'Failed to fetch attendance records. Please try again later.');
        this.loading = false;
      }
    );
  }
  

  
  

  
  
  onEditAttendance(record: AttendanceRecord) {
    // Logic to open modal and pass the selected record for editing
  }


  
  exportAttendance(format: string) {
    let fileName = `attendance.${format}`;
  
    try {
      if (!this.attendanceList || this.attendanceList.length === 0) {
        this.common.showCustomAlert(true, 'warning', 'No attendance data available to export.');
        return;
      }
  
      if (format === 'csv') {
        const csvData = this.convertToCSV(this.attendanceList);
        const blob = new Blob([csvData], { type: 'text/csv' });
        saveAs(blob, fileName);
        this.common.showCustomAlert(true, 'success', 'Attendance exported successfully as CSV.');
      } 
      else if (format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(this.attendanceList);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
  
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(data, fileName);
        this.common.showCustomAlert(true, 'success', 'Attendance exported successfully as Excel.');
      }
    } catch (error) {
      this.common.showCustomAlert(true, 'error', 'Failed to export attendance. Please try again.');
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
      width: '600px', 
      height: '600px', 
      maxWidth: '90vw', 
      maxHeight: '90vh',
      disableClose: true,
      autoFocus: false,
      data: { employeeId: this.attendanceRequest?.employeeId },
      panelClass: 'custom-dialog' // 👈 Add custom class
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAttendance();
      }
    });
  }
  
  openManualAttendance() {
    const dialogRef = this.dialog.open(ManualAttendanceComponent, {
      width: '670px', 
      height: '670px', 
      maxWidth: '90vw', 
      maxHeight: '90vh',
      disableClose: true,
      autoFocus: false,
      panelClass: 'custom-dialog' // Custom class for styling
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAttendance();
      }
    });
  }
  
  onPageChange(event: PageEvent) {
    this.attendanceRequest.pageNumber = event.pageIndex + 1; 
    this.attendanceRequest.pageSize = event.pageSize;
  }
  
  
  toggleFilters() {
    this.common.toggleExpanded();
  }
}
