import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { LocalStorageClear } from '../../common/export functions/customfunctions';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;
  Userpayload: any;
  jwtHelper = new JwtHelperService();
  token: any;


  constructor(private http: HttpClient,private router:Router) { }

  login(identifier: string, password: string): Observable<any> {
    const body = {email: identifier, password: password, twoFactorCode: '', twoFactorRecoveryCode: '', };
    return this.http.post<any>(`${this.apiUrl}Auth/login`, body); 
  }

    // Stores the token in local storage
    storeToken(tokenValue: string): void {
      localStorage.setItem('token', tokenValue);
    }
  
    // Retrieves the token from local storage
    getToken(): string | null {
      return localStorage.getItem('token');
    }
    getrefreshToken(): string | null {
      return localStorage.getItem('refreshtoken');
    }
    // Checks if the user is logged in by verifying the presence of a token
  
    StoreResfreshToke(tokenValue: string) {
      localStorage.setItem('refreshtoken', tokenValue);
  
    }
    resetToken(): void {
      localStorage.clear();
      localStorage.removeItem('token');
    }
    DecodeToken() {
      const JwtHelper = new JwtHelperService();
      const Token = this.getToken()!;
      if (Token) {
        return JwtHelper.decodeToken(Token);
      } else {
        return null;
      }
    }
  
    getFullNameFromToken(): string {
      const payload = this.decodeToken();
      if (payload && payload.FirstName && payload.LastName) {
        return `${payload.FirstName} ${payload.LastName}`;
      }
      return '';
    }
    private decodeToken(): any {
      this.token=this.getToken();
      if (this.token) {
        return this.jwtHelper.decodeToken(this.token);
      }
      return null;
    }
    getProfileType(): string {
      const payload = this.decodeToken();
      if (payload && payload.ProfileID) {
        return payload.ProfileID;
      }
      return '';
    }
    getDesignationFromToken(): string {
      const payload = this.decodeToken();
      if (payload && payload.Designation) {
        return payload.Designation;
      }
      return '';
    }
  
    // Returns the gender from the token
    getGenderFromToken(): string {
      const payload = this.decodeToken();
      if (payload && payload.Gender) {
        return payload.Gender;
      }
      return '';
    }
    getActivity(): any {
      return localStorage.getItem("activities");
    }
    getUserId() {
    //  return localStorage.getItem("UserID") || '';

      const payload = this.decodeToken();
      if (payload && payload.UserID) {
        return payload.UserID;
      }
      return '';
    }

    
    isLoggedIn() {
    const token = this.getToken();
    return !this.jwtHelper.isTokenExpired(token);
  }
  getUserRole(): any {
    if (this.DecodeToken().role === 'Admin') {
      return '1';
    }
    else if (this.DecodeToken().role === 'Manager') {
      return '2';
    }
    if (this.DecodeToken().role === 'Employee') {
      return '3';
    }
  }
  logout() {
    LocalStorageClear();
    this.router.navigate(['/account/login']);
  }
}