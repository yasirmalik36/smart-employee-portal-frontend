import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MaterialModule } from '../../shared/material module/material.module';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MaterialModule,FormsModule,ReactiveFormsModule,],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  rememberMe = false;
email: string='';
password: string='';
constructor(private router: Router) {} 

  toggleRememberMe() {
    this.rememberMe = !this.rememberMe;
  }

  onLogin() {
    this.router.navigate(['home/dashboard']); 

  }
}
