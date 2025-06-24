import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../shared/material module/material.module';
import { CommonModule, DatePipe } from '@angular/common';
import { LeaveService } from '../../services/leave.service';
import { CommonService } from '../../../../common/services/common.service';
import { ToastService } from '../../../../shared/components/services/toaster.service';
import { AttendanceService } from '../../../attendance/services/attendance.service';
import { AuthService } from '../../../../account/services/auth.service';

@Component({
  selector: 'app-leave-dialog',
  standalone: true,
  imports: [FormsModule, MaterialModule, CommonModule],
  templateUrl: './leave-dialog.component.html',
  styleUrls: ['./leave-dialog.component.css'],
  providers: [DatePipe]
})

export class LeaveDialogComponent implements OnInit {
  leaveTypes: any[] = [
    { id: 1, name: 'Sick Leave', icon: 'sick', description: 'For health-related issues' },
    { id: 2, name: 'Casual Leave', icon: 'event', description: 'For personal matters' },
    { id: 3, name: 'Annual Leave', icon: 'beach_access', description: 'For vacations' },
    { id: 4, name: 'Unpaid Leave', icon: 'money_off', description: 'Leave without pay' },
    { id: 5, name: 'Maternity Leave', icon: 'child_friendly', description: 'For new parents' },
    { id: 6, name: 'Paternity Leave', icon: 'family_restroom', description: 'For new fathers' },
  ];
  private authservice = inject(AuthService);

  employeeData: any[] = [];
  searchText: string = '';
  selectedEmployee: any = null;
  minDate: Date;
  maxDate: Date;
  
  numberOfDays: number = 0;
  isHalfDay: boolean = false;
  isLoading: boolean = false;
  leaveBalance: any = {};
  selectedLeaveType: any;
  attachments: File[] = [];
  leaveData: any[] = [];
  userid!: any;
  profiletype!: string;

  constructor(
    public dialogRef: MatDialogRef<LeaveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public common: CommonService,
    private leaveService: LeaveService,
    private toastService: ToastService,
    private attendanceService: AttendanceService,
    private datePipe: DatePipe
  ) {
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear, 0, 1);
    this.maxDate = new Date(currentYear, 11, 31);
  }

  ngOnInit() {
    this.userid = this.authservice.getUserId();
    this.profiletype = this.authservice.getProfileType();
if(this.userid && this.profiletype=="3"){
this.searchText=this.userid;
this.fetchEmployeesbyid(this.userid);
}
    if (this.data && this.data.EmployeeID) {
      this.selectedEmployee = {
        EmployeeID: this.data.EmployeeID,
        EmployeeName: this.data.EmployeeName
      };
      this.loadLeaveBalance(this.data.EmployeeID);
    }else{
      debugger
      this.data={};
      this.data.leaveType=this.leaveTypes;
    }
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }
  fetchEmployees(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.searchText.trim()) {
      this.isLoading = true;
      this.attendanceService.getEmployeeDetails(this.searchText).subscribe(
        (response: any) => {
          if (response.resp?.code === "00") {
            this.employeeData = response.employeeData || [];
            this.employeeData.forEach(emp => {
              emp.DateOfBirth = this.common.dateMatFormatter(emp.DateOfBirth);
            });
          } else {
            this.employeeData = [];
          }
          this.isLoading = false;
        },
        (error: any) => {
          console.error('Error fetching employees:', error);
          this.employeeData = [];
          this.isLoading = false;
        }
      );
    }
  }


    fetchEmployeesbyid(id:any) {
    if (id) {
      this.isLoading = true;
      this.attendanceService.getEmployeeDetails(id).subscribe(
        (response: any) => {
          if (response.resp?.code === "00") {
            debugger
            this.employeeData = response.employeeData || [];
            this.employeeData.forEach(emp => {
              emp.DateOfBirth = this.common.dateMatFormatter(emp.DateOfBirth);
            });
            this.selectedEmployee={};
                      this.selectedEmployee = {
        EmployeeID: response?.employeeData[0].EmployeeID,
        EmployeeName: response?.employeeData[0].EmployeeName
      };
              this.loadLeaveBalance(id);
          } else {
            this.employeeData = [];
          }
          this.isLoading = false;
        },
        (error: any) => {
          console.error('Error fetching employees:', error);
          this.employeeData = [];
          this.isLoading = false;
        }
      );
    }
  }
  selectEmployee(employee: any) {
    this.selectedEmployee = employee;
    this.loadLeaveBalance(employee.EmployeeID);
  }

  loadLeaveBalance(employeeId: number) {
    this.leaveService.getLeaveBalance(employeeId).subscribe({
      next: (response) => {

        if (response.code === "00") {
          this.leaveBalance = response || {};
        } else {
          this.leaveBalance = {};
        }
      },
      error: (error) => {
        console.error('Error fetching leave balance:', error);
        this.leaveBalance = {};
      }
    });
  }

  calculateDays(): void {
    if (this.data.StartDate && this.data.EndDate) {
      const start = new Date(this.data.StartDate);
      const end = new Date(this.data.EndDate);

      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        // Calculate business days (excluding weekends)
        let count = 0;
        const curDate = new Date(start);
        while (curDate <= end) {
          const dayOfWeek = curDate.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip Sunday and Saturday
            count++;
          }
          curDate.setDate(curDate.getDate() + 1);
        }
        this.numberOfDays = this.isHalfDay ? count * 0.5 : count;
      } else {
        this.numberOfDays = 0;
      }
    } else {
      this.numberOfDays = 0;
    }
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.attachments.push(files[i]);
      }
    }
  }

  removeAttachment(index: number) {
    this.attachments.splice(index, 1);
  }

  save(): void {
    if (!this.validateForm()) return;

    const payload = {
      LeaveID: this.data.LeaveID || 0,
      EmployeeID: this.selectedEmployee.EmployeeID,
      LeaveType: this.data.LeaveType,
      StartDate: this.data.StartDate,
      EndDate: this.data.EndDate,
      IsHalfDay: this.isHalfDay,
      Reason: this.data.Reason,
       Status: 'Pending' as const, // Explicitly type as 'Pending'
      AppliedDate: new Date().toISOString()
    };

    this.isLoading = true;
    this.leaveService.addOrUpdateLeave(payload).subscribe({
      next: (res: any) => {
        debugger
        this.isLoading = false;
        if (res.code === '00') {
          this.toastService.showSuccess(res.description || 'Leave application submitted successfully!');
          
          // Upload attachments if any
          if (this.attachments.length > 0) {
            this.uploadAttachments(res.leaveId);
          } else {
            this.dialogRef.close(true);
          }
        } else {
          this.toastService.showError(res.description || 'Failed to submit leave application.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.showError('An error occurred while submitting leave application.');
        console.error('API error:', err);
      }
    });
  }

  uploadAttachments(leaveId: number) {
    const formData = new FormData();
    this.attachments.forEach(file => {
      formData.append('attachments', file);
    });

    this.leaveService.uploadLeaveDocuments(leaveId, formData).subscribe({
      next: (res) => {
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.toastService.showWarning('Leave submitted but document upload failed.');
        this.dialogRef.close(true);
      }
    });
  }

  validateForm(): boolean {
    if (!this.selectedEmployee) {
      this.toastService.showError('Please select an employee');
      return false;
    }

    if (!this.data.LeaveType) {
      this.toastService.showError('Please select a leave type');
      return false;
    }

    if (!this.data.StartDate || !this.data.EndDate) {
      this.toastService.showError('Please select start and end dates');
      return false;
    }

    if (new Date(this.data.StartDate) > new Date(this.data.EndDate)) {
      this.toastService.showError('End date cannot be before start date');
      return false;
    }

    if (!this.data.Reason || this.data.Reason.trim().length < 10) {
      this.toastService.showError('Please provide a valid reason (minimum 10 characters)');
      return false;
    }

    // Check leave balance if applicable
    if (this.data.LeaveType !== 'Unpaid Leave') {
      const leaveTypeKey = this.data.LeaveType.replace(' ', '') + 'Balance';
      if (this.leaveBalance[leaveTypeKey] < this.numberOfDays) {
        this.toastService.showError(`Insufficient ${this.data.LeaveType} balance`);
        return false;
      }
    }

    return true;
  }

  closeDialog() {
    this.dialogRef.close(false);
  }
}