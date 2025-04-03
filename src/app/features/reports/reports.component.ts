import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material module/material.module';
import { FormsModule } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent {
  reportType: string = 'attendance';
  startDate: Date = new Date();
  endDate: Date = new Date();
  department: string = 'all';
  employee: string = 'all';

  reportTypes: string[] = ['attendance', 'leave', 'performance', 'task', 'payroll'];
  departments: string[] = ['all', 'HR', 'Development', 'Marketing'];
  employees: string[] = ['all', 'Yasir Mehmood', 'John Doe', 'Jane Smith'];

  generateReport(): void {
    console.log('Generating report:', {
      reportType: this.reportType,
      startDate: this.startDate,
      endDate: this.endDate,
      department: this.department,
      employee: this.employee,
    });
  }

  getReportIcon(type: string): string {
    switch (type) {
      case 'attendance':
        return 'event';
      case 'leave':
        return 'date_range';
      case 'performance':
        return 'assessment';
      case 'task':
        return 'assignment';
      case 'payroll':
        return 'attach_money';
      default:
        return 'description';
    }
  }
}