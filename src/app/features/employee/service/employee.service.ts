import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

export interface EmployeeRequest {
  employeeID?: number | null;
  pageNumber?: number;
  pageSize?: number;
}

export interface EmployeeResponse {
  employeeData: any[];
  resp: any;
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {

  private apiUrl = environment.apiUrl+'Employee';


  constructor(private http: HttpClient) {}


  getEmployeeInfoByID(request: EmployeeRequest = {}): Observable<EmployeeResponse> {
    const params = new HttpParams({
      fromObject: {
        employeeID: request.employeeID?.toString() || 0,
        pageNumber: (request.pageNumber || 1).toString(),
        pageSize: (request.pageSize || 10).toString()
      }
    });

    return this.http.get<EmployeeResponse>(`${this.apiUrl}/GetEmployeeInfoByID`, { params });
  }
  resetPassword(model:any): Observable<any> {
    const body = {
      employeeId: model.employeeId,
      newPassword: model.newPassword || null, 
      oldPassword: model.oldPassword || null 
    };
    return this.http.post<any>(`${this.apiUrl}/ResetEmployeePassword`, body);
  }

}