import { Component, Inject, inject } from '@angular/core';
import { WebcamImage, WebcamModule } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { AttendanceService } from '../../services/attendance.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../../../shared/components/services/toaster.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from '../../../../common/services/common.service';

@Component({
  selector: 'app-face-recognition',
  standalone: true,
  imports: [WebcamModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './face-recognition.component.html',
  styleUrl: './face-recognition.component.css',
})
export class FaceRecognitionComponent {
  public webcamImage: WebcamImage | null = null;
  private trigger: Subject<void> = new Subject<void>();
  isScanning = false;
  scanResult: string | null = null;
  retryCount = 0;
  emp: any = {}; // Store employee data
  employeeID: string = '';
  checkInTime: string = '';
  checkOutTime: string = '';
  workHours: number = 0;
  faceTrackingActive = false; // NEW: Shows "Face detected!" message
  darkMode = false;
  private synth = window.speechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private toastService = inject(ToastService);
  private attendanceService = inject(AttendanceService);
  private common = inject(CommonService);

  isSuccess: boolean=false;
  profilePic: any;
  scanSuccess: boolean=false;

  constructor(
    private dialogRef: MatDialogRef<FaceRecognitionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.synth.onvoiceschanged = () => {
      this.voices = this.synth.getVoices();
    };
  }

  /** Triggers face capture snapshot */
  triggerSnapshot(): void {
    if (this.retryCount >= 3) {
      this.scanResult = "Face not recognized. Please try again later.";
      this.retryCount = 0;
      return;
    }

    this.retryCount++;
    this.trigger.next();
  }

  /** Handles webcam image capture */
  handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.isScanning = true;
    this.scanResult = null;
    this.faceTrackingActive = true; // NEW: Show face detected indicator

    setTimeout(() => {
      this.faceTrackingActive = false; // Hide face detected indicator
      this.processFaceRecognition(webcamImage);
    }, 2000);
  }

  /** Processes the face recognition logic */
  private processFaceRecognition(webcamImage: WebcamImage) {
    this.isScanning = true;
    this.attendanceService.markAttendance(webcamImage.imageAsDataUrl).subscribe(
      (response) => {
        this.isScanning = false;
        this.scanResult = response.resp?.description || 'No response from server';
        this.isSuccess = response?.resp?.code === '00';

        if (response?.resp?.code === '00') {
      
          this.retryCount = 0;
          this.emp = response.emp || {};
          this.employeeID = response.employeeID || 'N/A';
          this.checkInTime = this.common.TimeMatFormatter(response.checkInTime)  || 'N/A';
          this.checkOutTime = this.common.TimeMatFormatter(response.checkOutTime) || 'N/A';
          this.workHours = response.workHours || 0;
  
          const Emp_FullName = response.emp?.emp_FullName || 'User';
          const isCheckIn = response.resp.description.toLowerCase().includes('check-in');
          const message = isCheckIn
            ? `Welcome ${Emp_FullName}! Have a great day.`
            : `Goodbye ${Emp_FullName}! See you next time.`;
  
          this.speak(message, 'female');
          this.toastService.showSuccess(response.resp.description);
          this.isSuccess=true;
          this.scanSuccess = true;
          setTimeout(() => this.dialogRef.close(true), 30000);
        } else {
          this.retryCount < 3 ? setTimeout(() => this.triggerSnapshot(), 1500) : this.failRecognition(response.resp.description);
        }
      },
      (error) => this.failRecognition('Face recognition failed. Please try again.')
    );
  }
  
  private failRecognition(message: string) {
    this.isScanning = false;
    this.scanResult = message;
    this.toastService.showError(message);
    setTimeout(() => this.dialogRef.close(false), 3000);
  }
  
  /** Handles text-to-speech voice feedback */
  speak(message: string, voiceGender: 'male' | 'female'): void {
    if (!this.synth || this.synth.speaking) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message);
    this.voices = this.synth.getVoices();
    this.setVoice(utterance, voiceGender);
    this.synth.speak(utterance);
  }

  private setVoice(utterance: SpeechSynthesisUtterance, gender: 'male' | 'female'): void {
    let preferredVoices = this.voices.filter(v =>
      gender === 'female' ? v.name.toLowerCase().includes('female') : v.name.includes('male')
    );
    utterance.voice = preferredVoices.length > 0 ? preferredVoices[0] : this.voices.find(v => v.default) || this.voices[0];
    utterance.lang = utterance.voice?.lang || 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = gender === 'female' ? 1 : 0.8;
  }

  /** Observable to trigger the webcam snapshot */
  get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

/** Toggles dark mode */
toggleDarkMode() {
  const htmlElement = document.documentElement;
  htmlElement.classList.toggle('dark');
  
  // Save the preference to localStorage (optional)
  const isDarkMode = htmlElement.classList.contains('dark');
  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
}


  /** Closes the modal */
  closeModal() {
    this.dialogRef.close(false);
  }
}
