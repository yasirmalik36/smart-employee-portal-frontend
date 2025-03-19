import { Component, Inject, OnInit } from '@angular/core';
import { AttendanceService } from '../../services/attendance.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../shared/material module/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manual-attendance',
  standalone: true,
  imports: [ReactiveFormsModule,FormsModule,MaterialModule,CommonModule],
  templateUrl: './manual-attendance.component.html',
  styleUrl: './manual-attendance.component.css'
})
export class ManualAttendanceComponent {
  searchText: string = ''; // For employee ID or name search
  employeeData: any[] = []; // Replace with real data source or API
  selectedEmployee: any = null;

  constructor(
    public dialogRef: MatDialogRef<ManualAttendanceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    // You can fetch employee data from an API here if needed
    // For demo purposes, we'll assume you have an employee data array
    this.employeeData = [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
      // Add more employees as needed
    ];
  }

  // Filter employee data based on the search text
  filterEmployees() {
    return this.employeeData.filter(emp => 
      emp.name.toLowerCase().includes(this.searchText.toLowerCase()) || 
      emp.id.toString().includes(this.searchText)
    );
  }

  // Handle Check-in action
  markCheckIn() {
    if (this.selectedEmployee) {
      // Call the API to mark check-in for the selected employee
      console.log(`Check-in marked for Employee ID: ${this.selectedEmployee.id}`);
    }
  }

  // Handle Check-out action
  markCheckOut() {
    if (this.selectedEmployee) {
      // Call the API to mark check-out for the selected employee
      console.log(`Check-out marked for Employee ID: ${this.selectedEmployee.id}`);
    }
  }

  // Close the dialog
  closeDialog() {
    this.dialogRef.close();
  }
}