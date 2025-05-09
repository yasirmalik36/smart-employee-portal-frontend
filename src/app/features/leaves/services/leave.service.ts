import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// leave-record.model.ts (or leave-record.ts)
export interface LeaveRecord {
  LeaveID: number;
  EmployeeID: number;
  Employee_Name?: string; // Optional, might be included in the fetched data
  LeaveType: string;
  StartDate: string; // ISO 8601 date string (YYYY-MM-DD)
  EndDate: string;   // ISO 8601 date string (YYYY-MM-DD)
  Reason?: string;    // Optional
  Status: 'Pending' | 'Approved' | 'Rejected';
  CreatedDate?: string; // Optional
  UpdatedDate?: string; // Optional
  ProfilePic?: string; // Optional
  Gender?: 'Male' | 'Female'; // Optional
  // Add any other properties that your Leave Record object might have
}// leave-request.model.ts (or leave-request.ts)
export interface LeaveRequest {
  employeeId?: string;     // Optional
  leaveType?: string;       // Optional
  status?: '' | 'Pending' | 'Approved' | 'Rejected'; // Optional, '' for all
  fromDate?: string;        // Optional, ISO 8601 date string (YYYY-MM-DD)
  toDate?: string;          // Optional, ISO 8601 date string (YYYY-MM-DD)
  dateRange?: 'currentMonth' | 'lastMonth' | 'last3Months' | 'yearToDate' | 'lastYear' | 'custom';
  pageNumber: number;
  pageSize: number;
  // Add any other filtering criteria you might need
}


@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private apiUrl = 'https://localhost:7162/api/Attendance';

  constructor(private http: HttpClient) {}

  getLeaves(request: LeaveRequest): Observable<any[]> {
    if (!request.employeeId) {
      request.employeeId = "0";
    }
    return this.http.post<any[]>(`${this.apiUrl}/GetLeaves`, request);
  }

  applyLeave(leave: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ApplyLeave`, leave);
  }

  editLeave(leave: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/EditLeave/${leave.leaveId}`, leave);
  }

  approveLeave(leaveId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/ApproveLeave/${leaveId}`, {});
  }

  rejectLeave(leaveId: number, reason: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/RejectLeave/${leaveId}`, { reason });
  }
}