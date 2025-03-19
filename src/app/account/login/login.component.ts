import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MaterialModule } from '../../shared/material module/material.module';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../shared/components/services/toaster.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MaterialModule,FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  rememberMe = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', Validators.required], // Accepts both Email or Username
      password: ['', Validators.required]
    });
  }

  toggleRememberMe() {
    this.rememberMe = !this.rememberMe;
  }

  onLogin() {
    debugger
    if (this.loginForm.invalid) {
      this.toastService.showWarning('Please fill in all fields');
      return;
    }
    const { identifier, password } = this.loginForm.value;

    this.authService.login(identifier, password).subscribe(
      (response:any) => {
        if (response.resp.code === '00') {
           debugger
          localStorage.setItem('token', response.token);
          //localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('activites', JSON.stringify(response.act));
          this.toastService.showSuccess('Login Successful');
          this.router.navigate(['home/dashboard']);
        } else {
          // Failed login
          this.toastService.showError(response.resp.description);

        }
      },
      (error:any) => {
        this.toastService.showError('Login failed. Please check your credentials.');

      }
    );
  }
}