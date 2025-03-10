// attendance.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private apiUrl = environment.apiUrl+'Attendance';

  constructor(private http: HttpClient) {}

  getAttendance(request: any): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/GetAttendance`, request);
  }

  markAttendance(base64Image: string): Observable<any> {
    const formData = new FormData();
    
    const file = this.base64ToFile(base64Image, 'face_capture.png');
    formData.append('ImageFile', file);
  
    return this.http.post(`${this.apiUrl}/MarkAttendance`, formData);
  }
  
  private base64ToFile(base64String: string, fileName: string): File {
    // Decode the Base64 string and convert it to a binary data array
    const byteString = atob(base64String.split(',')[1]); // Decode base64 (excluding the prefix 'data:image/png;base64,')
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);
  
    // Fill the array with byte data
    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }
  
    // Create a Blob object from the byte array, with the proper MIME type
    const blob = new Blob([intArray], { type: 'image/png' });
    
    // Create and return a File object
    return new File([blob], fileName, { type: 'image/png' });
  }
  
}
