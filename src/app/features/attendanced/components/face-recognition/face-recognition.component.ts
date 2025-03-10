import { Component, inject } from '@angular/core';
import { WebcamImage, WebcamModule } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { AttendanceService } from '../../services/attendance.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../../../shared/components/services/toaster.service';

@Component({
  selector: 'app-face-recognition',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,WebcamModule,FormsModule],
  templateUrl: './face-recognition.component.html',
  styleUrl: './face-recognition.component.css'
})
export class FaceRecognitionComponent {
  public webcamImage: WebcamImage | null = null;
  private trigger: Subject<void> = new Subject<void>();
  isScanning = false;
  userId: string = '12345'; // Replace with actual user ID
  scanResult: string | null = null;
  constructor(private attendanceService: AttendanceService,private toastService: ToastService) {}

  triggerSnapshot(): void {
    this.trigger.next();
  }

  handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.isScanning = true;
    this.scanResult = null;

    this.attendanceService.markAttendance( webcamImage.imageAsDataUrl).subscribe(
      response => {

        if(response.resp.code=="00"){
          this.scanResult = response.resp.description;
          this.toastService.showSuccess(response.resp.description);

          this.isScanning = false;
        }else{
          this.isScanning = false;
          this.toastService.showError(response.resp.description);

        }
     
      },
      error => {
        console.error('Face recognition error:', error);
        this.scanResult = 'Face recognition failed. Please try again.';
        this.isScanning = false;
      }
    );
  }

  get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }
}