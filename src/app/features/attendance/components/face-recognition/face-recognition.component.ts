import { ChangeDetectorRef, Component, Inject, inject, OnDestroy } from '@angular/core';
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
  styleUrls: ['./face-recognition.component.css'],
})
export class FaceRecognitionComponent implements OnDestroy {
  public webcamImage: WebcamImage | null = null;
  private trigger: Subject<void> = new Subject<void>();
  isScanning = false;
  scanResult: string | null = null;
  retryCount = 0;
  emp: any = {};
  employeeID = '';
  checkInTime = '';
  checkOutTime = '';
  workHours = 0;
  faceTrackingActive = false;
  private synth = window.speechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private toastService = inject(ToastService);
  private attendanceService = inject(AttendanceService);
  private common = inject(CommonService);
  isSuccess = false;
  scanSuccess = false;
  isDarkMode = false;
  private closeTimeout: any;
  private voiceLoaded = false;

  constructor(
    private dialogRef: MatDialogRef<FaceRecognitionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdr: ChangeDetectorRef
  ) {
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
    this.synth.onvoiceschanged = () => {
      setTimeout(() => {
        this.voices = this.synth.getVoices();
        this.cdr.detectChanges();
      }, 100); // Ensure voices are loaded properly before using them
    };
  }

  ngOnDestroy() {
    this.synth.cancel();
    clearTimeout(this.closeTimeout);
  }

  // triggerSnapshot(): void {
  //   if (this.retryCount >= 3) {
  //     this.scanResult = 'Face not recognized. Please try again later.';
  //     this.closeModal();
  //     return;
  //   }
  //   this.retryCount++;
  //   this.cdr.detectChanges();
  //   this.trigger.next();
  // }
  triggerSnapshot(): void {
    if (this.retryCount >= 3) {
      this.scanResult = 'Face not recognized. Please try again later.';
      this.speak(this.scanResult, 'female', () => {
        this.closeModal();
      });
      return;
    }
  
    this.retryCount++;
    this.cdr.detectChanges();
  
    // Speak the attempt message if retry count is greater than 1
    if (this.retryCount >1) {
     // const attemptMessage = `Attempt ${this.retryCount}. Please adjust your position.`;
      this.speak('Please adjust your position', 'female', () => {
      });
    }
    this.trigger.next();

  }
  
  handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    this.isScanning = true;
    this.faceTrackingActive = true;

    clearTimeout(this.closeTimeout);
    this.closeTimeout = setTimeout(() => {
      this.faceTrackingActive = false;
      this.cdr.detectChanges();
      this.processFaceRecognition(webcamImage.imageAsDataUrl);
    }, 1500); // Adding delay before processing face recognition
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
        } else if (response.resp?.code === '01') {
          this.speak(response.resp.description, 'female', () => {
            setTimeout(() => this.triggerSnapshot(), 5000); // Adding delay before retry
          });
        } else {
          this.retryOrFail(response.resp.description);
        }
      },
      (error) => {
        console.error('Face recognition error:', error);
        this.retryOrFail('Face recognition failed. Please try again.');
      }
    );
  }

  private handleSuccessResponse(response: any) {
    this.retryCount = 0;
    this.employeeID = response.employeeID || 'N/A';
    this.checkInTime = this.common.TimeMatFormatter(response.checkInTime) || 'N/A';
    this.checkOutTime = this.common.TimeMatFormatter(response.checkOutTime) || 'N/A';
    this.workHours = response.workHours || 0;
    this.scanSuccess = true;
    const firstName = response.emp?.firstName;
    const lastName = response.emp?.lastName;
    const empFullName = `${firstName} ${lastName}` || 'User';
    this.emp = response.emp || {};
    this.emp.emp_FullName = empFullName;
    const isCheckIn = response.status.toLowerCase().includes('checked-in');
    const message = isCheckIn
      ? `Welcome ${firstName}! Have a great day.`
      : `Goodbye ${firstName}! See you next time.`;

    this.speak(message, 'female', () => {
      setTimeout(() => {
        this.toastService.showSuccess(response.resp.description);
        this.closeTimeout = setTimeout(() => this.dialogRef.close(true), 2000); // Adding delay before closing the dialog
      }, 2000);
    });
  }

  private retryOrFail(message: string) {
    this.retryCount < 3
      ? setTimeout(() => this.triggerSnapshot(), 2000) // Adding delay before retrying
      : this.failRecognition(message);
  }
  private failRecognition(message: string) {
    this.isScanning = false;
    this.scanResult = message;
    this.toastService.showError(message);
    
    // Speak the error message
    this.speak(message, 'female', () => {
      setTimeout(() => {
        this.dialogRef.close(false);
      }, 2000); // Adding delay before closing the modal
    });
  }
  

  speak(message: string, voiceGender: 'female', callback?: () => void): void {
    if (!this.synth) return;
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    this.setVoice(utterance, voiceGender);
    utterance.onend = () => callback?.();
    this.synth.speak(utterance);
  }

  private setVoice(utterance: SpeechSynthesisUtterance, gender: 'male' | 'female'): void {
    let preferredVoices: SpeechSynthesisVoice[] = [];
    if (gender === 'female') {
      preferredVoices = this.voices.filter((v) =>
        v.name.toLowerCase().includes('female') || v.lang.toLowerCase().includes('female')
      );
    } else if (gender === 'male') {
      preferredVoices = this.voices.filter((v) =>
        v.name.toLowerCase().includes('male') || v.lang.toLowerCase().includes('male')
      );
    }

    if (preferredVoices.length === 0) {
      preferredVoices = this.voices.filter(v =>
        v.lang.toLowerCase().includes('en-us') || v.lang.toLowerCase().includes('en-in')
      );
    }

    utterance.voice = preferredVoices.length > 0
      ? preferredVoices[0]
      : this.voices.find((v) => v.default) || this.voices[0];
    
    utterance.lang = utterance.voice?.lang || 'en-US';
    utterance.rate = 1;
    utterance.pitch = gender === 'female' ? 1.8 : 1;
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
    clearTimeout(this.closeTimeout);
    this.dialogRef.close(false);
  }
}
