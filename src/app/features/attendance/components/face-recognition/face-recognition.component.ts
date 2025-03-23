import { ChangeDetectorRef, Component, Inject, inject, NgZone, OnDestroy, OnInit } from '@angular/core';
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
export class FaceRecognitionComponent implements OnInit, OnDestroy {
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
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.isDarkMode = localStorage.getItem('theme') === 'dark';
  }

  ngOnInit() {
    console.log('Component initialized');
    this.loadVoices();
  }

  private loadVoices(): void {
    this.voices = this.synth.getVoices();
    if (this.voices.length > 0) {
      this.voiceLoaded = true;
      console.log('Voices loaded:', this.voices);
      return;
    }

    this.synth.onvoiceschanged = () => {
      this.ngZone.run(() => {
        this.voices = this.synth.getVoices();
        if (this.voices.length > 0) {
          this.voiceLoaded = true;
          console.log('Voices loaded:', this.voices);
        } else {
          setTimeout(() => this.loadVoices(), 500);
        }
      });
    };
  }

  ngOnDestroy() {
    console.log('Component destroyed');
    this.synth.cancel();
    clearTimeout(this.closeTimeout);
  }

  triggerSnapshot(): void {
    if (this.retryCount >= 3) {
      this.closeModal();

      speechSynthesis.cancel();
      this.scanResult = 'Face not recognized. Please try again later.';
      this.speak(this.scanResult, 'female', () => {
        this.closeModal();
      });
      return;
    }

    this.retryCount++;

    if (this.retryCount > 1) {
      this.speak('Please adjust your position', 'female', () => {});
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
      this.processFaceRecognition(webcamImage.imageAsDataUrl);
    }, 1500);
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
            setTimeout(() => this.triggerSnapshot(), 1000);
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
    const isCheckIn = response.status.toLowerCase().includes('check-in');
    const message = isCheckIn
      ? `Welcome ${firstName}!`
      : `Goodbye ${firstName}`;

    this.speak(message, 'female', () => {
      setTimeout(() => {
        this.closeTimeout = setTimeout(() => this.dialogRef.close(true), 1000);
      }, 1000);
      this.toastService.showSuccess(response.resp.description);

    });

  }

  private retryOrFail(message: string) {
    this.retryCount < 3
      ? setTimeout(() => this.triggerSnapshot(), 2000)
      : this.failRecognition(message);
  }

  private failRecognition(message: string) {
    this.isScanning = false;
    this.scanResult = message;
    this.toastService.showError(message);

    this.speak(message, 'female', () => {
      setTimeout(() => {
        this.dialogRef.close(false);
      }, 1000);
    });
  }

  speak(message: string, voiceGender: 'female', callback?: () => void): void {
    if (!this.synth || !this.voiceLoaded) {
      console.warn('Speech synthesis not available or voices not loaded.');
      callback?.(); // Ensure callback is called even if speech synthesis is unavailable
      return;
    }
  
    try {
      console.log('Speaking message:', message);
  
      this.synth.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      this.setVoice(utterance, voiceGender);
  
      utterance.onend = () => {
        console.log('Speech finished');
        callback?.();
      };
  
      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        callback?.(); // Ensure callback is called even in case of an error
      };
  
      this.synth.speak(utterance);
    } catch (error) {
      console.error('Unexpected error in speech synthesis:', error);
      callback?.(); // Call the callback even if an exception occurs
    }
  }
  

  private setVoice(utterance: SpeechSynthesisUtterance, gender: 'male' | 'female'): void {
    console.log('All available voices:', this.voices);

    let preferredVoices: SpeechSynthesisVoice[] = [];

    if (gender === 'female') {
      preferredVoices = this.voices.filter((v) => {
        const isFemale =
                           v.name.toLowerCase().includes('google us english') 
                         || v.name.toLowerCase().includes('female')
                         || v.name.toLowerCase().includes('woman') 
                         || v.name.toLowerCase().includes('zira');
        const isEnglish = v.lang.toLowerCase().includes('en');
        return isFemale && isEnglish;
      });

      console.log('Filtered female voices:', preferredVoices);

      if (preferredVoices.length === 0) {
        preferredVoices = this.voices.filter((v) => v.lang.toLowerCase().includes('en'));
        console.log('Fallback English voices:', preferredVoices);
      }
    }

    utterance.voice = preferredVoices.length > 0
      ? preferredVoices[0]
      : this.voices.find((v) => v.default) || this.voices[0];

    console.log('Selected voice:', utterance.voice);
    utterance.lang = utterance.voice?.lang || 'en-US';
    utterance.rate = 1.9;
    utterance.pitch = gender === 'female' ? 1.2 : 1;
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
    console.log('Closing modal');
    clearTimeout(this.closeTimeout);
    this.dialogRef.close(false);
  }
}