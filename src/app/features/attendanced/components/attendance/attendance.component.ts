import { Observable, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WebcamImage, WebcamModule } from 'ngx-webcam';
import { HttpClient } from '@angular/common/http';
import { FaceRecognitionComponent } from '../face-recognition/face-recognition.component';
import { AttendanceService } from '../../services/attendance.service';
interface AttendanceRequest {
  userID: number;
  dateFrom: string;
  dateTo: string;
  dateRange: string;
}

interface AttendanceRecord {
  userID: number;
  attendanceDate: string;
  checkInTime: string;
  checkOutTime: string;
  status: string;
  workHours: number;
}
@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule,ReactiveFormsModule,FaceRecognitionComponent,],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css'
})export class AttendanceComponent implements OnInit {
  attendanceList: AttendanceRecord[] = [];
  loading = false;
  attendanceRequest: AttendanceRequest = {
    userID: 0, // Default to all users
    dateFrom: '',
    dateTo: '',
    dateRange: 'currentMonth' // Default date range
  };
  dateRanges = [
    { value: 'currentMonth', label: 'Current Month' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'yearToDate', label: 'Year to Date' },
    { value: 'custom', label: 'Custom Range' }
  ];
  showCustomDates = false;

  constructor(private attendanceService: AttendanceService) { }

  ngOnInit() {
    this.setDateRange(); // Set initial date range on component initialization
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
        return; // Don't set dates here if custom
      default:
        return;
    }

    this.attendanceRequest.dateFrom = fromDate.toISOString().split('T')[0];
    this.attendanceRequest.dateTo = toDate.toISOString().split('T')[0];
  }

  getAttendance() {
    this.loading = true;

    if (this.attendanceRequest.dateRange !== 'custom') {
      this.setDateRange(); // Update dates based on selected range
    }

    this.attendanceService.getAttendance(this.attendanceRequest)
      .subscribe(
        (data: AttendanceRecord[]) => {
          this.attendanceList = data;
          this.loading = false;
        },
        (error: any) => {
          console.error('Error fetching attendance:', error);
          this.loading = false;
        }
      );
  }

  convertToLocalTime(timeString: string): string {
    const formattedTime = timeString.split('.')[0];
    const date = new Date(`1970-01-01T${formattedTime}`);

    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
}