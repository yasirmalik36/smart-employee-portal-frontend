import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { WebcamImage, WebcamModule } from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';
import * as faceapi from 'face-api.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../shared/material module/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { FaceRecognitionService } from '../../services/setting.service';

interface Employee {
    id: number;
    name: string;
}

interface FaceData {
    employeeId: number;
    imagePath: string;
    file?: File; // Store the File object
    embedding?: number[];
}

@Component({
    selector: 'app-face-recognition-config',
    standalone: true,
    imports: [WebcamModule, MaterialModule, CommonModule, FormsModule],
    templateUrl: './face-recognition-config.component.html',
    styleUrl: './face-recognition-config.component.css'
})
export class FaceRecognitionConfigComponent implements OnInit, OnDestroy {
    @ViewChild('fileInput') fileInput: ElementRef | undefined;

    trigger: Subject<void> = new Subject<void>();
    searchTerm: string = '';
    selectedEmployee: Employee | null = null;
    uploadedImage: string | ArrayBuffer | null = null;
    filteredEmployees: Employee[] = [];
    allEmployees: Employee[] = [
        { id: 1, name: 'Alice Johnson' },
        { id: 2, name: 'Bob Smith' },
        { id: 3, name: 'Charlie Davis' },
        { id: 4, name: 'David Lee' },
        { id: 5, name: 'Eve Williams' }
    ];
    savedFaces: FaceData[] = [];
    displayedColumns: string[] = ['image', 'actions'];
    faceDetectionError: string | null = null;
    saveStatusMessage: string = '';
    saveStatus: 'success' | 'error' | 'pending' | null = null;
    savedFacesDataSource: MatTableDataSource<FaceData> = new MatTableDataSource<FaceData>(this.savedFaces);

    private readonly MODEL_URI = '/assets/models';
    private faceMatcher: faceapi.FaceMatcher | null = null;

    constructor(
        private snackBar: MatSnackBar,
        private faceRecognitionService: FaceRecognitionService // Inject the new service
    ) {
        this.loadModels();
        this.filteredEmployees = [...this.allEmployees];
    }

    ngOnInit(): void {
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
        // Clean up resources if needed
    }

    get triggerObservable(): Observable<void> {
        return this.trigger.asObservable();
    }

    get savedFacesForSelectedEmployee(): FaceData[] {
        return this.savedFaces.filter(face => face.employeeId === this.selectedEmployee?.id);
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
                 faceapi.nets.ssdMobilenetv1.loadFromUri(this.MODEL_URI) // Optional, but good for other detection scenarios
            ]);
            console.log('FaceAPI models loaded');
            // Optionally load existing embeddings to create a FaceMatcher
            // this.loadExistingEmbeddings();
        } catch (error) {
            console.error('Error loading FaceAPI models:', error);
            this.snackBar.open('Error loading face recognition models.', 'Dismiss', { duration: 5000 });
        }
    }

    captureImage(): void {
        this.trigger.next();
    }

    filterEmployees(): void {
        const term = this.searchTerm.toLowerCase();
        this.filteredEmployees = this.allEmployees.filter(emp =>
            emp.name.toLowerCase().includes(term) || emp.id.toString().includes(term)
        );
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

                // Convert Data URL to a File object
                const base64Response = await fetch(webcamImage.imageAsDataUrl);
                const blob = await base64Response.blob();
                const file = new File([blob], `captured_face_${Date.now()}.png`, { type: 'image/png' });

                this.savedFaces.push({
                    employeeId: this.selectedEmployee.id,
                    imagePath: webcamImage.imageAsDataUrl,
                    file: file, // Store the File
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
                            employeeId: this.selectedEmployee.id,
                            imagePath: this.uploadedImage as string,
                            file: file, // Store the File
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
        this.savedFaces = this.savedFaces.filter(f => f !== face);
        this.updateSavedFacesDataSource();
        this.snackBar.open('Face removed locally. You might need to implement API deletion if required.', 'Dismiss', { duration: 3000 });
    }

    deleteAllFacesForEmployee(): void {
        if (this.selectedEmployee) {
            this.savedFaces = this.savedFaces.filter(f => f.employeeId !== this.selectedEmployee?.id);
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
                  return this.faceRecognitionService.saveFace(this.selectedEmployee.id, faceData.file).toPromise(); // Convert Observable to Promise for easier handling in Promise.all
              }
              return Promise.resolve(null); // Handle cases without a file (shouldn't happen here)
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
              this.saveStatusMessage = `Successfully saved ${successCount} face(s) for ${this.selectedEmployee.name}!`;
              this.saveStatus = 'success';
              this.snackBar.open(this.saveStatusMessage, 'Dismiss', { duration: 3000 });
              this.savedFaces = this.savedFaces.filter(face => face.employeeId !== this.selectedEmployee?.id);
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
}