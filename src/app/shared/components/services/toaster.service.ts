import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';  // Import ToastrService

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastr: ToastrService) {}

  showSuccess(message: string, title: string = '', duration: number = 3000): void {
    this.toastr.success(message, title, { timeOut: duration });
  }

  showError(message: string, title: string = '', duration: number = 3000): void {
    this.toastr.error(message, title, { timeOut: duration });
  }

  showWarning(message: string, title: string = '', duration: number = 3000): void {
    this.toastr.warning(message, title, { timeOut: duration });
  }

  showInfo(message: string, title: string = '', duration: number = 7000): void {
    this.toastr.info(message, title, { timeOut: duration });
  }
}
