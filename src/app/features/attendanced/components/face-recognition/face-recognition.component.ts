import { Component, Inject, inject } from '@angular/core';
import { WebcamImage, WebcamModule } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { AttendanceService } from '../../services/attendance.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../../../shared/components/services/toaster.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
  faceTrackingActive = false; // NEW: Shows "Face detected!" message
  darkMode = false;
  private synth = window.speechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private toastService = inject(ToastService);
  private attendanceService = inject(AttendanceService);
  isSuccess: boolean=false;

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
    this.attendanceService.markAttendance(webcamImage.imageAsDataUrl).subscribe(
      (response) => {
        this.isScanning = false;
        this.scanResult = response.resp?.description || 'No response from server';
        this.isSuccess = response?.resp?.code === '00';

        if (response?.resp?.code == '00') {
          this.retryCount=0;
          const Emp_FullName = response.emp?.emp_FullName || 'User';
          const isCheckIn = response.resp.description.toLowerCase().includes('check-in');
          const message = isCheckIn
            ? `Welcome ${Emp_FullName}! Have a great day.`
            : `Goodbye ${Emp_FullName}! See you next time.`;

          this.speak(message, 'female');
          this.toastService.showSuccess(response.resp.description);

          setTimeout(() => {
            this.dialogRef.close(true);
          }, 5000);
        } else {
          if (this.retryCount < 3) {
            setTimeout(() => this.triggerSnapshot(), 1500);
          } else {
            this.isScanning = false;
            this.toastService.showError(response.resp.description);
            setTimeout(() => {
              this.dialogRef.close(false);
            }, 3000);
          }
        }
      },
      (error) => {
        console.error('Face recognition error:', error);
        this.scanResult = 'Face recognition failed. Please try again.';
        this.isScanning = false;
        setTimeout(() => {
          this.dialogRef.close(false);
        }, 3000);
      }
    );
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
    this.darkMode = !this.darkMode;
  }

  /** Closes the modal */
  closeModal() {
    this.dialogRef.close(false);
  }
}
