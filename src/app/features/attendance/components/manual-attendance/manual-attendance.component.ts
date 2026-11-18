import { Component, inject, Inject, OnInit } from '@angular/core';
import { AttendanceService } from '../../services/attendance.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../shared/material module/material.module';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../shared/components/services/toaster.service';
import { CommonService } from '../../../../common/services/common.service';
import { AttendanceRequest } from '../../../../models/AttendanceRequest';

@Component({
  selector: 'app-manual-attendance',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, MaterialModule, CommonModule],
  templateUrl: './manual-attendance.component.html',
  styleUrl: './manual-attendance.component.css'
})
export class ManualAttendanceComponent implements OnInit {
  searchText: string = ''; // For employee ID or name search
  employeeData: any[] = []; // Stores employee search results
  selectedEmployee: any = null;
  isLoading: boolean = false;
  private toastService = inject(ToastService);
  private attendanceService = inject(AttendanceService);
  public common = inject(CommonService);
  StatusresponseData: any;
  employeeStatus: string='';
  constructor(
    public dialogRef: MatDialogRef<ManualAttendanceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
  }

  fetchEmployees(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.searchText.trim()) {
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
        },
        (error) => {
          console.error('Error fetching employees:', error);
          this.employeeData = [];
        }
      );
    }
  }  
  selectEmployee(employee: any) {
    this.selectedEmployee = employee;
    this.checkStatus(employee.EmployeeID); // Check attendance status
  }

  checkStatus(empID: number): void {
    const request = {
      employeeId: empID,
      attendanceID: 0,
      fromDate: null,
      toDate: null,
      dateRange: '',
      pageNumber: 1,
      pageSize: 10
    };
  
    this.attendanceService.checkAttendanceStatus(request).subscribe({
      next: (response) => {
        if (response.resp?.code === "00" && response.employeeData?.length !== 0) {
          this.StatusresponseData = response.employeeData[0];  // Store only first object
          this.employeeStatus = this.StatusresponseData.Status  // Normalize case
        } else {
          this.employeeStatus = '';  // No attendance record
          this.StatusresponseData = null;
        }
      },
      error: (error) => {
        console.error('Error fetching attendance status:', error);
        this.employeeStatus = ''; // Handle error case
        this.StatusresponseData = null;
      }
    });
  }
  
  filterEmployees() {
    return this.employeeData.filter(emp =>
      emp.name.toLowerCase().includes(this.searchText.toLowerCase()) || 
      emp.id.toString().includes(this.searchText)
    );
  }

  
  markAttendance(employeeId: number, flag: 'checkin' | 'checkout') {
    this.attendanceService.markManualAttendance(employeeId, flag).subscribe({
      next: (response) => {
        if (response.resp?.code === "00") {
          this.checkStatus(employeeId); // Check attendance status
          this.toastService.showSuccess(response.resp?.description)
        }else{
          this.toastService.showError(response.resp?.description)

        }
      },
      error: (error) => {
        console.error(`Error marking ${flag} attendance:`, error);
      }
    });
  }
  get isCheckInDisabled(): boolean {
    return (this.employeeStatus?.toLowerCase() === 'present' || 
            this.employeeStatus?.toLowerCase() === 'check-in' || 
            this.employeeStatus?.toLowerCase() === 'half-day' ||
            this.employeeStatus?.toLowerCase() === 'short-hours') 
             && this.StatusresponseData?.CheckInTime;
  }
  
  get isCheckOutDisabled(): boolean {
    return this.employeeStatus?.toLowerCase() === 'present' && this.StatusresponseData?.CheckOutTime || this.StatusresponseData== null;
    
  }
  
  closeDialog() {
    if(this.StatusresponseData){
      this.dialogRef.close(true);

    }else{
      this.dialogRef.close(false);
    }
  }
}
