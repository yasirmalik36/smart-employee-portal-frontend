import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LeaveRequest {
  leaveType: string;
  userID: number;
  dateFrom: string;
  dateTo: string;
}

interface Leave {
  leaveId: number;
  userID: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
}

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private apiUrl = 'https://localhost:7162/api/Attendance';

  constructor(private http: HttpClient) {}

  getLeaves(request: LeaveRequest): Observable<Leave[]> {
    return this.http.post<Leave[]>(`${this.apiUrl}/GetAllLeaves`, request);
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