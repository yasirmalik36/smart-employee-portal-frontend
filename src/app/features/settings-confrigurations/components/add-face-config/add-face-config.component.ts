import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { WebcamImage, WebcamModule } from 'ngx-webcam';
import { Subject, Observable, of } from 'rxjs';
import * as faceapi from 'face-api.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../shared/material module/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { AttendanceService } from '../../../attendance/services/attendance.service';
import { ToastService } from '../../../../shared/components/services/toaster.service';
import { CommonService } from '../../../../common/services/common.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SettingsService } from '../../services/setting.service';
import { MatDialogRef } from '@angular/material/dialog';

interface Employee {
  EmployeeID: number;
  EmployeeName: string;
  DateOfBirth?: string;
  DepartmentName?: string;
  DesignationName?: string;
  Gender?: string;
  ProfilePic?: string;
}

interface FaceData {
  employeeId: number;
  imagePath: string;
  file?: File;
  embedding?: number[];
}
@Component({
  selector: 'app-add-face-config',
  standalone: true,
  imports: [WebcamModule, MaterialModule, CommonModule, FormsModule],
  templateUrl: './add-face-config.component.html',
  styleUrl: './add-face-config.component.css'
})
export class AddFaceConfigComponent implements OnInit, OnDestroy {

  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  private toastService = inject(ToastService);
  private attendanceService = inject(AttendanceService);
  private settingService = inject(SettingsService);
  public common = inject(CommonService);
  private dialogRef = inject(MatDialogRef<AddFaceConfigComponent>);
  trigger: Subject<void> = new Subject<void>();
  searchTerm: string = '';
  selectedEmployee: Employee | null = null;
  uploadedImage: string | ArrayBuffer | null = null;
  filteredEmployees: Employee[] = [];
  allEmployees: Employee[] = []; // Keep this for potential caching or other uses
  savedFaces: FaceData[] = []; // Re-declare savedFaces
  displayedColumns: string[] = ['image', 'actions'];
  faceDetectionError: string | null = null;
  saveStatusMessage: string = '';
  saveStatus: 'success' | 'error' | 'pending' | null = null;
  savedFacesDataSource: MatTableDataSource<FaceData> = new MatTableDataSource<FaceData>(this.savedFaces);

  private readonly MODEL_URI = '/assets/models';
  private faceMatcher: faceapi.FaceMatcher | null = null;
  private searchSubject = new Subject<string>();

  constructor(
    private snackBar: MatSnackBar,
  ) {
    this.loadModels();
  }

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.searchEmployees(term))
    ).subscribe(employees => {
      this.filteredEmployees = employees;
    });

    // Simulate loading existing saved faces (replace with actual API call)
    setTimeout(() => {
      this.savedFaces = [
        { employeeId: 1, imagePath: 'assets/images/face1.jpg' },
        { employeeId: 2, imagePath: 'assets/images/face2.jpg' }
      ];
      this.updateSavedFacesDataSource();
    }, 500);
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  get savedFacesForSelectedEmployee(): FaceData[] {
    return this.savedFaces.filter((face: FaceData) => face.employeeId === this.selectedEmployee?.EmployeeID);
  }

  updateSavedFacesDataSource(): void {
    this.savedFacesDataSource.data = this.savedFacesForSelectedEmployee;
  }

  async loadModels(): Promise<void> {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(this.MODEL_URI),
        faceapi.nets.faceLandmark68Net.loadFromUri(this.MODEL_URI),
        faceapi.nets.faceRecognitionNet.loadFromUri(this.MODEL_URI),
        faceapi.nets.ssdMobilenetv1.loadFromUri(this.MODEL_URI)
      ]);
      console.log('FaceAPI models loaded');
    } catch (error) {
      console.error('Error loading FaceAPI models:', error);
      this.snackBar.open('Error loading face recognition models.', 'Dismiss', { duration: 5000 });
    }
  }

  captureImage(): void {
    this.trigger.next();
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchTerm);
  }

  searchEmployees(term: string): Observable<Employee[]> {
    if (!term.trim()) {
      return of([]); // Use 'of' to create an Observable of an empty array
    }
    return this.attendanceService.getEmployeeDetails(term).pipe(
      switchMap((response: any): Observable<Employee[]> => { // Explicitly type the return of switchMap
        if (response.resp?.code === "00") {
          const employees: Employee[] = response.employeeData || [];
          employees.forEach(emp => {
            emp.DateOfBirth = this.common.dateMatFormatter(emp.DateOfBirth);
          });
          return of(employees); // Use 'of' to create an Observable
        } else {
          this.toastService.showError('Search Error', response.resp?.message || 'No employees found.');
          return of([]); // Return an Observable of an empty array on error
        }
      })
    );
  }

  selectEmployee(employee: Employee) {
    this.selectedEmployee = employee;
    this.filteredEmployees = [];
    this.searchTerm = employee.EmployeeName;
  }

  async handleImage(webcamImage: WebcamImage): Promise<void> {
    this.faceDetectionError = null;
    if (!this.selectedEmployee) {
      this.faceDetectionError = 'Please select an employee first.';
      return;
    }

    try {
      const image = await faceapi.fetchImage(webcamImage.imageAsDataUrl);
      const detections = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 1 && detections[0].descriptor && this.selectedEmployee) {
        console.log('Face detected and features extracted.');

        const base64Response = await fetch(webcamImage.imageAsDataUrl);
        const blob = await base64Response.blob();
        const file = new File([blob], `captured_face_${Date.now()}.png`, { type: 'image/png' });

        this.savedFaces.push({
          employeeId: this.selectedEmployee.EmployeeID,
          imagePath: webcamImage.imageAsDataUrl,
          file: file,
          embedding: Array.from(detections[0].descriptor)
        });
        this.updateSavedFacesDataSource();
        this.snackBar.open('Face captured successfully!', 'Dismiss', { duration: 2000 });
        this.uploadedImage = null;
      } else if (detections.length > 1) {
        this.faceDetectionError = 'Multiple faces detected. Please ensure only one face is in the frame.';
      } else {
        this.faceDetectionError = 'No face detected. Please try again.';
      }
    } catch (error) {
      console.error('Error handling webcam image:', error);
      this.faceDetectionError = 'Error processing image.';
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    this.faceDetectionError = null;
    if (!this.selectedEmployee) {
      this.faceDetectionError = 'Please select an employee first.';
      return;
    }

    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = async () => {
        this.uploadedImage = reader.result;
        try {
          const image = await faceapi.fetchImage(this.uploadedImage as string);
          const detections = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptors();

          if (detections.length === 1 && detections[0].descriptor && this.selectedEmployee) {
            console.log('Face detected in uploaded image.');
            this.savedFaces.push({
              employeeId: this.selectedEmployee.EmployeeID,
              imagePath: this.uploadedImage as string,
              file: file,
              embedding: Array.from(detections[0].descriptor)
            });
            this.updateSavedFacesDataSource();
            this.snackBar.open('Face from image uploaded successfully!', 'Dismiss', { duration: 2000 });
          } else if (detections.length > 1) {
            this.faceDetectionError = 'Multiple faces detected in the uploaded image. Please upload an image with only one face.';
            this.uploadedImage = null;
          } else {
            this.faceDetectionError = 'No face detected in the uploaded image. Please try another image.';
            this.uploadedImage = null;
          }
        } catch (error) {
          console.error('Error handling uploaded image:', error);
          this.faceDetectionError = 'Error processing uploaded image.';
          this.uploadedImage = null;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  deleteFace(face: FaceData): void {
    this.savedFaces = this.savedFaces.filter((f: FaceData) => f !== face);
    this.updateSavedFacesDataSource();
    this.snackBar.open('Face removed locally. You might need to implement API deletion if required.', 'Dismiss', { duration: 3000 });
  }

  deleteAllFacesForEmployee(): void {
    if (this.selectedEmployee) {
      this.savedFaces = this.savedFaces.filter((f: FaceData) => f.employeeId !== this.selectedEmployee?.EmployeeID);
      this.updateSavedFacesDataSource();
      this.snackBar.open('All saved faces removed locally. You might need to implement API deletion if required.', 'Dismiss', { duration: 3000 });
    }
  }

  async saveFacesToDatabase(): Promise<void> {
    if (!this.selectedEmployee || this.savedFacesForSelectedEmployee.length === 0) {
      this.snackBar.open('Please select an employee and capture/upload at least one face.', 'Dismiss', { duration: 3000 });
      return;
    }

    this.saveStatusMessage = 'Saving faces...';
    this.saveStatus = 'pending';

    try {
      const savePromises = this.savedFacesForSelectedEmployee.map(async (faceData) => {
        if (faceData.file && this.selectedEmployee) {
          return this.settingService.saveFace(this.selectedEmployee.EmployeeID, faceData.file).toPromise();
        }
        return Promise.resolve(null);
      });

      const responses = await Promise.all(savePromises);
      let successCount = 0;
      responses.forEach(response => {
        if (response && response.code === '00') {
          successCount++;
        } else if (response) {
          this.snackBar.open(`Error saving face: ${response.message || response.description}`, 'Dismiss', { duration: 5000 });
        } else {
          this.snackBar.open('Error saving face.', 'Dismiss', { duration: 5000 });
        }
      });

      if (successCount === this.savedFacesForSelectedEmployee.length) {
        this.saveStatusMessage = `Successfully saved ${successCount} face(s) for ${this.selectedEmployee.EmployeeName}!`;
        this.saveStatus = 'success';
        this.snackBar.open(this.saveStatusMessage, 'Dismiss', { duration: 3000 });
        this.savedFaces = this.savedFaces.filter((face: FaceData) => face.employeeId !== this.selectedEmployee?.EmployeeID);
        this.updateSavedFacesDataSource();
      } else {
        this.saveStatusMessage = `Saved ${successCount} out of ${this.savedFacesForSelectedEmployee.length} faces. Check details for errors.`;
        this.saveStatus = 'error';
        this.snackBar.open(this.saveStatusMessage, 'Dismiss', { duration: 5000 });
      }

    } catch (error) {
      console.error('Error saving faces:', error);
      this.saveStatusMessage = 'Error saving faces. Please try again.';
      this.saveStatus = 'error';
      this.snackBar.open(this.saveStatusMessage, 'Dismiss', { duration: 5000 });
    } finally {
      setTimeout(() => {
        this.saveStatusMessage = '';
        this.saveStatus = null;
      }, 3000);
    }
  }
  closeDialog() {
    this.dialogRef.close(true);
}
}