import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { LineChartComponent } from '../../shared/components/line-chart/line-chart.component';
import { DonutChartComponent } from '../../shared/components/donut-chart/donut-chart.component';
import { MaterialModule } from '../../shared/material module/material.module';
import { AuthService } from '../../account/services/auth.service';
import { LeaveService } from '../../features/leaves/services/leave.service';
import { AttendanceService } from '../../features/attendance/services/attendance.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, StatsCardComponent, LineChartComponent, DonutChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  fullName!: string;
  employeeCount = 0;
  attendanceRate = 0;
  onLeaveCount = 0;
  pendingRequests = 0;
  
  // Sample data - replace with real API calls
  recentLeaveRequests = [
    {
      employee: { name: 'John Doe', avatar: 'assets/images/man.png' },
      type: 'Annual',
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 3)),
      status: 'Pending'
    },
    // Add more sample data...
  ];

  upcomingHolidays = [
    { name: 'New Year', date: new Date('2024-01-01'), daysLeft: 10 },
    // Add more holidays...
  ];

  employeeBirthdays = [
    { name: 'Sarah Johnson', avatar: 'assets/images/woman.png', date: new Date(), isToday: true },
    // Add more birthdays...
  ];

  attendanceData = {
    // Sample chart data
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Attendance Rate',
        data: [95, 89, 92, 97],
        borderColor: '#3B82F6',
        backgroundColor: '#BFDBFE',
        tension: 0.3
      }
    ]
  };

  leaveBalanceData = {
    labels: ['Annual', 'Sick', 'Casual', 'Unpaid'],
    datasets: [
      {
        data: [12, 5, 8, 3],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
      }
    ]
  };

  constructor(
    private authService: AuthService,
    private leaveService: LeaveService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit() {
    this.fullName = this.authService.getFullNameFromToken();
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Implement actual service calls here
    this.employeeCount = 120;
    this.attendanceRate = 92;
    this.onLeaveCount = 8;
    this.pendingRequests = 5;
    
    // Example of real service calls:
    /*
    this.leaveService.getPendingRequests().subscribe(requests => {
      this.pendingRequests = requests.length;
      this.recentLeaveRequests = requests.slice(0, 5);
    });
    
    this.attendanceService.getTodayAttendance().subscribe(data => {
      this.attendanceRate = data.rate;
      this.onLeaveCount = data.onLeave;
    });
    */
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getLeaveTypeClass(type: string): string {
    switch(type) {
      case 'Annual': return 'bg-blue-100 text-blue-800';
      case 'Sick': return 'bg-green-100 text-green-800';
      case 'Casual': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}