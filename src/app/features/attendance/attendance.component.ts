import { Observable, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WebcamImage, WebcamModule } from 'ngx-webcam';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule,ReactiveFormsModule,WebcamModule],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css'
})export class AttendanceComponent {
  attendanceList: any[] = [];
  loading = false;
  attendanceRequest = {
    userID: 0, // 0 means fetch all users
    dateFrom: '',
    dateTo: ''
  };

  constructor(private http: HttpClient) {}

  getAttendance() {
    this.loading = true;
    this.http.post<any[]>('https://localhost:7162/api/Attendance/GetAttendance', this.attendanceRequest)
      .subscribe(
        (        data: any[]) => {
          this.attendanceList = data;
          this.loading = false;
        },
        (        error: any) => {
          console.error('Error fetching attendance:', error);
          this.loading = false;
        }
      );
  }
}
