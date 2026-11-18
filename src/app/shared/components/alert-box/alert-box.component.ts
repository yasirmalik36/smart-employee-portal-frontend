import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-alert-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-box.component.html',
  styleUrl: './alert-box.component.css'
})
export class AlertBoxComponent {
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() message: string = '';
  @Input() autoClose: boolean = true;
  @Input() duration: number = 3000; // Default 3 seconds
  @Output() close = new EventEmitter<void>();

  ngOnInit() {
    if (this.autoClose) {
      setTimeout(() => {
        this.close.emit();
      }, this.duration);
    }
  }

  onClose() {
    this.close.emit();
  }
  getAlertClass() {
    return {
      'alert-success': this.type === 'success',
      'alert-error': this.type === 'error',
      'alert-warning': this.type === 'warning',
      'alert-info': this.type === 'info',
    };
}
}