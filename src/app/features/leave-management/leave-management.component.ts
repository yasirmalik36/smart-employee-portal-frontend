import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-leave-management',
  standalone: true,
  imports: [FormsModule ,CommonModule ],
  templateUrl: './leave-management.component.html',
  styleUrl: './leave-management.component.css'
})
export class LeaveManagementComponent {


  leaveTypes: string[] = ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Unpaid Leave'];
  leaveList: any[] = [];
  loading = false;
  leaveRequest = {
    leaveType:'',
    userID: 0, // 0 means fetch all users
    dateFrom: '',
    dateTo: ''
  };

  constructor(private http: HttpClient) {}

  getLeaves() {
    this.loading = true;
    this.http.post<any[]>('https://localhost:7162/api/Attendance/GetAllLeaves', this.leaveRequest)
      .subscribe(
        data => {
          this.leaveList = data;
          this.loading = false;
        },
        error => {
          console.error('Error fetching leaves:', error);
          this.loading = false;
        }
      );
  }
}


