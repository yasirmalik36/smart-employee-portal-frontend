import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

interface SaveFaceResponse {
    code: string;
    employee_id: number | null;
    message: string;
    description: string;
}
interface EmployeeFaceStatusResponse {
  resp: {
      message: string;
      code: string;
      description: string;
  };
  employeeFaces: Array<any>;
}
@Injectable({
    providedIn: 'root',
})
export class SettingsService {
    private apiUrl = environment.apiUrl + 'FaceRecognition';

    constructor(private http: HttpClient) {}

    saveFace(employeeId: number, imageFile: File): Observable<SaveFaceResponse> {
        const formData = new FormData();
        formData.append('ImageFile', imageFile, imageFile.name);

        return this.http.post<SaveFaceResponse>(
            `${this.apiUrl}/SaveFace?employeeId=${employeeId}`,
            formData
        );
    }
    getEmployeeFaceDetails(employeeIdOrName: string): Observable<EmployeeFaceStatusResponse> {
      return this.http.get<EmployeeFaceStatusResponse>(
          `${this.apiUrl}/GetEmployeeFaceDetails?employeeIdOrName=${employeeIdOrName}`
      );
  }
  deleteFaceById(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/DeleteFace/${id}`);
}

}