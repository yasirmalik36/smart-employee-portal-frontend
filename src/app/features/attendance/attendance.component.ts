import { Observable, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { WebcamImage, WebcamModule } from 'ngx-webcam';
@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,WebcamModule],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css'
})
export class AttendanceComponent {
  private trigger: Subject<void> = new Subject<void>();
  public capturedImages: WebcamImage[] = [];
  public isCapturing: boolean = false;
  public captureProgress = 0;

  constructor() {}

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public startCaptureSequence(): void {
    this.capturedImages = []; // Reset captured images
    this.isCapturing = true;
    this.captureImages();
  }

  private async captureImages() {
    for (let i = 1; i <= 5; i++) { // Capture 5 images
      this.captureProgress = (i / 5) * 100;
      this.trigger.next();
      await this.delay(1000); // Delay to give the ring effect
    }
    this.isCapturing = false;
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.capturedImages.push(webcamImage);
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public saveImages(): void {
    const imageArray = this.capturedImages.map(image => image.imageAsDataUrl);
    // Call backend service to save the images (implement your API call here)
    console.log("Images ready to be saved:", imageArray);
  }
}
