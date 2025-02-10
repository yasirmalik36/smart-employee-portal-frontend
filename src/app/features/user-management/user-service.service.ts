import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl;


  constructor(private http: HttpClient) {}


  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}Employee/GetUsers`);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}Employee/GetEmployeeInfoByUserID/${id}`);
  }
}