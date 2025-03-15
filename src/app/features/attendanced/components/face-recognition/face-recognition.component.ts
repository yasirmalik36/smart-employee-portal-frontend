import { ChangeDetectorRef, Component, Inject, inject } from '@angular/core';
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
  emp: any = {};
  employeeID: string = '';
  checkInTime: string = '';
  checkOutTime: string = '';
  workHours: number = 0;
  faceTrackingActive = false;
  private synth = window.speechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private toastService = inject(ToastService);
  private attendanceService = inject(AttendanceService);
  private common = inject(CommonService);
  isSuccess: boolean = false;
  scanSuccess: boolean = false;
  isDarkMode: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<FaceRecognitionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdr: ChangeDetectorRef 
  ) {
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    this.updateTheme();
    this.synth.onvoiceschanged = () => {
      this.voices = this.synth.getVoices();
      this.cdr.detectChanges();
    };
  }

  triggerSnapshot(): void {
    if (this.retryCount >= 3) {
      this.scanResult = "Face not recognized. Please try again later.";
      this.closeModal();
      return;
    }
    this.retryCount++;
    this.cdr.detectChanges(); 
    this.trigger.next();
  }

  handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.isScanning = true;
    this.faceTrackingActive = true;
   // Captured Image Size must be : 640x480
    setTimeout(() => {
      this.faceTrackingActive = false;
      this.cdr.detectChanges();
      this.performLivenessCheck(webcamImage.imageAsDataUrl);
    }, 1000); // Reduced timeout
  }

  performLivenessCheck(imageBase64: string): void {
    
    this.attendanceService.checkLiveness(imageBase64).subscribe(
      (response) => {
        if (response.code === "00") {
          this.processFaceRecognition(imageBase64);
        } else {
          this.handleFailedLiveness(response.code, response.description);
        }
      },
      () => {
        this.handleFailedLiveness("error", "Liveness detection failed.");
      }
    );
  }

  handleFailedLiveness(code: string, description: string): void {
    if (code === "01" && this.retryCount < 3) {
      this.faceTrackingActive = true;

      this.scanResult = `No face detected.Please Adjust your position.`;
      this.speak(this.scanResult, "female", () => setTimeout(() => this.triggerSnapshot(), 500));
    } else {
      this.scanResult = `${description} Please try again later.`;
      this.speak(this.scanResult, "female", () => this.closeModal());
    }
  }

  private processFaceRecognition(image: string) {
    this.isScanning = true;
    this.attendanceService.markAttendance(image).subscribe(
      (response) => {
        this.isScanning = false;
        this.scanResult = response.resp?.description || 'No response from server';
        this.isSuccess = response?.resp?.code === '00';

        if (this.isSuccess) {
          this.handleSuccessResponse(response);
        } else {
          this.retryCount < 3 ? setTimeout(() => this.triggerSnapshot(), 1000) : this.failRecognition(response.resp.description);
        }
      },
      () => this.failRecognition('Face recognition failed. Please try again.')
    );
  }

  private handleSuccessResponse(response: any) {
    this.retryCount = 0;
    this.employeeID = response.employeeID || 'N/A';
    this.checkInTime = this.common.TimeMatFormatter(response.checkInTime) || 'N/A';
    this.checkOutTime = this.common.TimeMatFormatter(response.checkOutTime) || 'N/A';
    this.workHours = response.workHours || 0;

    const firstName = response.emp?.firstName ;
    const lastName = response.emp?.lastName;
    const empFullName = firstName +" "+ lastName || 'User';
    this.emp = response.emp || {};
   this.emp.emp_FullName = empFullName;
    const isCheckIn = response.resp.description.toLowerCase().includes('check-in');
    const message = isCheckIn
      ? `Welcome ${firstName}! Have a great day.`
      : `Goodbye ${firstName}! See you next time.`;
      // const message = isCheckIn
      // ? `Welcome aboard,${empFullName}! Wishing you a fantastic and productive day ahead!`
      // : `Goodbye, ${empFullName}! Thanks for your hard work—see you next time!`;

    setTimeout(() => {
      this.speak(message, 'female', () => this.toastService.showSuccess(response.resp.description));
    }, 300); // Faster execution

    this.scanSuccess = true;
    setTimeout(() => this.dialogRef.close(true), 5000); // Faster exit
  }

  private failRecognition(message: string) {
    this.isScanning = false;
    this.scanResult = message;
    this.toastService.showError(message);
    setTimeout(() => this.dialogRef.close(false), 2000);
  }

  speak(message: string, voiceGender: 'male' | 'female', callback?: () => void): void {
    if (!this.synth) return;

    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    this.voices = this.synth.getVoices();
    this.setVoice(utterance, voiceGender);

    utterance.onend = () => callback?.();

    setTimeout(() => this.synth.speak(utterance), 100); // Faster execution
  }

  private setVoice(utterance: SpeechSynthesisUtterance, gender: 'male' | 'female'): void {
    let preferredVoices = this.voices.filter(v =>
      gender === 'female' ? v.name.toLowerCase().includes('female') : v.name.includes('male')
    );
    utterance.voice = preferredVoices.length > 0 ? preferredVoices[0] : this.voices.find(v => v.default) || this.voices[0];
    utterance.lang = utterance.voice?.lang || 'en-US';
    utterance.rate = 1;
    utterance.pitch = gender === 'female' ? 1 : 0.8;
  }

  get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    this.updateTheme();
  }

  private updateTheme() {
    document.body.classList.toggle('dark', this.isDarkMode);
  }
  closeModal() {
    this.dialogRef.close(false);
  }
}
