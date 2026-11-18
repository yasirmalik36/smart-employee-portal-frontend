import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface LeaveRecord {
  LeaveID: number;
  EmployeeID: number;
  EmployeeName?: string;
  EmployeeCode?: string;
  DepartmentName?: string;
  DesignationName?: string;
  LeaveType: string;
  StartDate: string;
  EndDate: string;
  IsHalfDay: boolean;
  Reason?: string;
  Status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  AppliedDate?: string;
  ActionDate?: string;
  ActionBy?: string;
  Remarks?: string;
  ProfilePic?: string;
  Gender?: string;
  DocumentPath?: string;
}

export interface LeaveRequest {
  employeeId?: number;
  leaveId?: number;
  leaveType?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  dateRange?: string;
  pageNumber: number;
  pageSize: number;
  searchText?: string;
}

export interface LeaveBalance {
  code: string;
  EmployeeID: number;
  SickBalance: number;
  CasualBalance: number;
  AnnualBalance: number;
  UnpaidBalance: number;
  MaternityBalance?: number;
  PaternityBalance?: number;
  TotalLeavesTaken: number;
    balanceData?: any; // Make optional if not always present
  resp?: any; 
}

export interface LeaveType {
  LeaveTypeID: number;
  LeaveTypeName: string;
  Description: string;
  IsActive: boolean;
  IsDocumentRequired: boolean;
  MaxDays: number;
}

export interface LeaveDocument {
  DocumentID: number;
  LeaveID: number;
  FileName: string;
  FilePath: string;
  FileType: string;
  UploadedDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private apiUrl = `${environment.apiUrl}Attendance/`;

  constructor(private http: HttpClient) {}

  // Get leave records with pagination and filtering
  getLeaves(request: LeaveRequest): Observable<{ data: LeaveRecord[], totalCount: number }> {
    return this.http.post<{ data: LeaveRecord[], totalCount: number }>(`${this.apiUrl}GetLeaves`, request);
  }

  // Get leave balance for an employee
  getLeaveBalance(employeeId: number): Observable<LeaveBalance> {
    return this.http.get<LeaveBalance>(`${this.apiUrl}GetLeaveBalance`, {
      params: new HttpParams().set('employeeId', employeeId.toString())
    });
  }

  // Create or update a leave application
  addOrUpdateLeave(leave: Partial<LeaveRecord>): Observable<{ resp: { code: string; description: string }, leaveId: number }> {
    return this.http.post<{ resp: { code: string; description: string }, leaveId: number }>(
      `${this.apiUrl}AddUpdateLeave`, 
      leave
    );
  }

  // Approve or reject a leave application
  approveOrRejectLeave(payload: { 
    LeaveID: number; 
    Action: number; 
    Remarks?: string;
    ActionBy: string;
  }): Observable<{ resp: { code: string; description: string } }> {
    return this.http.post<{ resp: { code: string; description: string } }>(
      `${this.apiUrl}LeaveAR`, 
      payload
    );
  }

  // Cancel a leave application
  cancelLeave(leaveId: number, employeeId: number, remarks: string = ''): Observable<any> {
    return this.http.post(`${this.apiUrl}CancelLeave`, {
      LeaveID: leaveId,
      EmployeeID: employeeId,
      Remarks: remarks
    });
  }

  // Get available leave types
  getLeaveTypes(): Observable<LeaveType[]> {
    return this.http.get<LeaveType[]>(`${this.apiUrl}GetLeaveTypes`);
  }

  // Upload documents for a leave application
  uploadLeaveDocuments(leaveId: number, files: FormData): Observable<LeaveDocument[]> {
    return this.http.post<LeaveDocument[]>(
      `${this.apiUrl}UploadLeaveDocuments/${leaveId}`, 
      files
    );
  }

  // Get documents for a leave application
  getLeaveDocuments(leaveId: number): Observable<LeaveDocument[]> {
    return this.http.get<LeaveDocument[]>(`${this.apiUrl}GetLeaveDocuments`, {
      params: new HttpParams().set('leaveId', leaveId.toString())
    });
  }

  // Delete a leave document
  deleteLeaveDocument(documentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}DeleteLeaveDocument`, {
      params: new HttpParams().set('documentId', documentId.toString())
    });
  }

  // Get leave statistics for dashboard
  getLeaveStatistics(employeeId?: number): Observable<{
    pending: number;
    approved: number;
    rejected: number;
    balance: LeaveBalance;
  }> {
    const params = employeeId ? 
      new HttpParams().set('employeeId', employeeId.toString()) : 
      new HttpParams();
      
    return this.http.get<{
      pending: number;
      approved: number;
      rejected: number;
      balance: LeaveBalance;
    }>(`${this.apiUrl}GetLeaveStatistics`, { params });
  }

  // Check leave availability for dates
  checkLeaveAvailability(employeeId: number, startDate: string, endDate: string): Observable<{
    isAvailable: boolean;
    conflictingLeaves: LeaveRecord[];
  }> {
    return this.http.get<{
      isAvailable: boolean;
      conflictingLeaves: LeaveRecord[];
    }>(`${this.apiUrl}CheckLeaveAvailability`, {
      params: new HttpParams()
        .set('employeeId', employeeId.toString())
        .set('startDate', startDate)
        .set('endDate', endDate)
    });
  }
}