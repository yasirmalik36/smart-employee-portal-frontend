import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../../features/employee/service/employee.service';
import { MaterialModule } from '../../../shared/material module/material.module';
import { CustomValidator } from '../../../models/custom-validator';
import { ToastService } from '../../../shared/components/services/toaster.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [MaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  employeeId: string = '';
  form!: FormGroup;
  hideOldPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  oldPasswordVisible = false;
  newPasswordVisible = false;
  confirmPasswordVisible = false;
  private toastService = inject(ToastService);
  private Service = inject(EmployeeService);
  private AuthService = inject(AuthService);

  constructor(private fb: FormBuilder, private router: Router, private location: Location) {
    this.fb = new FormBuilder();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.compose([
        Validators.required,
        CustomValidator.patternValidator(/\d/, { hasNumber: true }),
        CustomValidator.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
        CustomValidator.patternValidator(/[a-z]/, { hasSmallCase: true }),
        CustomValidator.patternValidator(/[~!@#$%^&*()_+|:"'/?.,]/, { hasSpecialCharacters: true }),
        Validators.minLength(8)
      ])]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator.bind(this)
    });
    this.employeeId = this.AuthService.getUserId();
  }

  toggleOldPasswordVisibility() {
    this.oldPasswordVisible = !this.oldPasswordVisible;
  }

  toggleNewPasswordVisibility() {
    this.newPasswordVisible = !this.newPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  passwordMatchValidator(control: AbstractControl) {
    const password: string = control.get('newPassword')?.value;
    const confirmPassword: string = control.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ NoPassswordMatch: true });
    }
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.form.controls[controlName].hasError(errorName);
  }

  changePassword(model: any) {
    if (this.form.valid) {
      model.employeeId = this.employeeId;
      this.Service.resetPassword(model).subscribe((data: any) => {
        if (data.resp.code == "00") {
          this.AuthService.logout();
          this.router.navigate(['/']);
          this.toastService.showSuccess(data.resp.description);
        } else {
          this.toastService.showError(data.resp.description);
        }
      });
    }
  }

  goBack() {
    this.location.back();
  }
}
