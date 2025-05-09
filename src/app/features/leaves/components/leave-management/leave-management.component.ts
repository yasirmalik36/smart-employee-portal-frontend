import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../shared/material module/material.module';
import { LeaveRecord, LeaveRequest, LeaveService } from '../../services/leave.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CommonService } from '../../../../common/services/common.service';
import { MatDialog } from '@angular/material/dialog';
import FileSaver, { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { LeaveDialogComponent } from '../leave-dialog/leave-dialog.component';

@Component({
  selector: 'app-leave-management',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './leave-management.component.html',
  styleUrl: './leave-management.component.css'
})
export class LeaveManagementComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public common = inject(CommonService);
  private leaveService = inject(LeaveService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  displayedColumns: string[] = [];
  columns: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  totalRecords = 0;
  pageNumber = 1;
  pageSize = 10;
  showCustomDates = false;
  loading = false;
  isExportDropdownOpen = false;
  leaveData: any[] = [];
  leaveTypes = [
    { value: 'Annual', label: 'Annual Leave' },
    { value: 'Sick', label: 'Sick Leave' },
    { value: 'Casual', label: 'Casual Leave' },
    // Add more leave types as needed
  ];
  dateRanges = [
    { value: 'currentMonth', label: 'Current Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'yearToDate', label: 'Year to Date' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];
  leaveRequest: LeaveRequest = {
    employeeId: '',
    leaveType: '',
    status: '',
    fromDate: '',
    toDate: '',
    dateRange: 'yearToDate',
    pageNumber: 1,
    pageSize: 25
  };
  tableWidth = this.common.Tablewidth;
  TableHeight = this.common.TableHeight;

  ngOnInit(): void {
    this.setDateRange();
    this.getLeaves();
  }

  toggleFilters() {
    this.common.toggleExpanded();
  }

  setDateRange() {
    const today = new Date();
    let fromDate: Date;
    let toDate: Date;

    switch (this.leaveRequest.dateRange) {
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
        fromDate = new Date(today);
        toDate = new Date(today);
        this.showCustomDates = true;
        break;
      default:
        return;
    }

    this.leaveRequest.fromDate = fromDate.toISOString().split('T')[0];
    this.leaveRequest.toDate = toDate.toISOString().split('T')[0];
  }

  searchLeaves() {
    this.leaveRequest.pageNumber = 1;
    this.paginator.pageIndex = 0;
    this.getLeaves();
  }

  getLeaves() {
    this.loading = true;
    this.leaveRequest.pageNumber = this.pageNumber;
    this.leaveRequest.pageSize = this.pageSize;

    this.leaveService.getLeaves(this.leaveRequest).subscribe(
      (response: any) => {
        this.loading = false;
        if (response?.resp?.code === '00') {
          this.leaveData = response.leavesData || [];
          this.totalRecords = response.resp.totalRecords || 0;

          if (this.leaveData.length === 0) {
            this.common.showCustomAlert(true, 'info', 'No leave records found for the selected filters.');
          }

          const excludedColumns = ['LeaveID', 'EmployeeID', 'ProfilePic','Gender','DateOfBirth'];
          this.columns = Object.keys(this.leaveData[0] || {})
            .filter(column => !excludedColumns.includes(column))
            .map(column => ({
              key: this.common.formatColumnName(column).key,
              title: this.common.formatColumnName(column).title,
            }));

          if (!this.columns.some(col => col.key === 'actions')) {
            this.columns.splice(1, 0, { key: 'actions', title: 'Action', width: '75px' });
          }
          if (!this.columns.some(col => col.key === 'Employee_Name')) {
            this.columns.unshift({ key: 'Employee_Name', title: 'Employee Name', width: '200px' });
          }
          this.displayedColumns = this.columns.map(col => col.key);

          const transformedData = this.leaveData.map((record: any) => {
            const newRecord: any = {};
            Object.keys(record).forEach(key => {
              newRecord[this.common.formatColumnName(key).key] = record[key];
            });
            if (newRecord.Start_Date) {
              newRecord.Start_Date= this.common.dateMatFormatter(newRecord.Start_Date);
            }
            if (newRecord.End_Date) {
              newRecord.End_Date = this.common.dateMatFormatter(newRecord.End_Date);
            }
            if (newRecord.DateOfBirth) {
              newRecord.DateOfBirth = this.common.dateMatFormatter(newRecord.DateOfBirth);
            }
            return newRecord;
          });
          this.dataSource = new MatTableDataSource(transformedData);
          this.cdr.detectChanges();
        } else {
          this.common.showCustomAlert(true, 'error', 'Failed to fetch leave records.');
        }
      },
      (error) => {
        this.loading = false;
        this.common.showCustomAlert(true, 'error', 'An error occurred while fetching leave records.');
      }
    );
  }

  onPageChange(event: PageEvent) {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getLeaves();
  }

  openApplyLeaveDialog(data?: LeaveRecord) {
    const dialogRef = this.dialog.open(LeaveDialogComponent, {
      width: '600px',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getLeaves();
      }
    });
  }

  onEditLeave(record: LeaveRecord) {
    this.openApplyLeaveDialog(record);
  }

  toggleExportDropdown() {
    this.isExportDropdownOpen = !this.isExportDropdownOpen;
  }

  exportLeaves(format: string) {
    this.isExportDropdownOpen = false;
    if (!this.leaveData || this.leaveData.length === 0) {
      this.common.showCustomAlert(true, 'warning', 'No leave data available to export.');
      return;
    }

    const exportData = this.leaveData.map(leave => {
      const formattedLeave: any = {};
      this.columns.filter(col => col.key !== 'actions').forEach(col => {
        formattedLeave[col.title] = leave[col.key];
      });
      return formattedLeave;
    });

    const fileName = `leaves.${format}`;
    if (format === 'csv') {
      const csvData = this.convertToCSV(exportData);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, fileName);
      this.common.showCustomAlert(true, 'success', 'Leave records exported successfully as CSV.');
    } else if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Leaves');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      saveAs(data, fileName);
      this.common.showCustomAlert(true, 'success', 'Leave records exported successfully as Excel.');
    } else if (format === 'pdf') {
      import('jspdf').then(jsPDF => {
        import('jspdf-autotable').then(autoTable => { // Import the autoTable function
          const doc = new jsPDF.default();
          const head = this.columns.filter(col => col.key !== 'actions').map(col => col.title);
          const body = exportData.map(leave => head.map(title => leave[title]));
          autoTable.default(doc, { head: [head], body }); // Use autoTable as a function
          doc.save(fileName);
          this.common.showCustomAlert(true, 'success', 'Leave records exported successfully as PDF.');
        });
      });
    }
  }

  private convertToCSV(data: any[]): string {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return `${headers}\n${rows.join('\n')}`;
  }
}