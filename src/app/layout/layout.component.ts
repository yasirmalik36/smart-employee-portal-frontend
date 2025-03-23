import { CommonModule } from '@angular/common';
import { Component, ElementRef, Renderer2, OnInit, OnDestroy, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../account/auth.service';
import { Activity } from '../models/Activity';
import { MaterialModule } from '../shared/material module/material.module';
import { CommonService } from '../common/services/common.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink,RouterModule, ReactiveFormsModule, CommonModule,MaterialModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  isUserMenuOpen = false;
  activities: Activity[] = []; 
  isCollapsed = false;
  profilePopupVisible: boolean = false;
  private clickListener!: (() => void);
  fullName: string = '';
  Designation: string = '';
  gender: string = '';  
  private router = inject(Router);
  private renderer = inject(Renderer2);
  private elRef = inject(ElementRef);
  private authService = inject(AuthService);
  private common = inject(CommonService);

  constructor() {
  }

  ngOnInit() {
    debugger
    const storedActivities = localStorage.getItem('activites');
    if (storedActivities) {
      this.activities = JSON.parse(storedActivities) as Activity[];
    }
    this.fullName = this.authService.getFullNameFromToken();
    this.Designation = this.authService.getDesignationFromToken();
    this.gender = this.authService.getGenderFromToken();
    this.clickListener = this.renderer.listen('document', 'click', (event: Event) => {
      const clickedInside = this.elRef.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.closeProfilePopup();
      }
    });
  }

  ngOnDestroy() {
    // Manually remove the event listener when the component is destroyed
    if (this.clickListener) {
      this.clickListener();
    }
  }



  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }
  // Toggle the profile popup visibility
  toggleProfilePopup() {
    this.profilePopupVisible = !this.profilePopupVisible;
  }

  // Toggle sidebar if needed
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.common.toggleSidebar(); // Toggle state using service
  }

  // Close the profile popup
  closeProfilePopup() {
    this.profilePopupVisible = false;
  }
  getIconForActivity(activityName: string): string {
    const icons: { [key: string]: string } = {
      'Dashboard': 'dashboard',
      'Attendance': 'today',
      'Leave Management': 'event_available',
      'Compensation & Benefits': 'monetization_on',
      'Employee Management': 'manage_accounts',
      'Task Management': 'task',
      'Reports': 'assessment',
      'AI-Driven Analytics': 'bar_chart',
      'Notification System': 'notifications',
      'Settings & Configuration': 'settings',
      'Document Repository': 'folder',
      'Account/Authentication': 'lock'
    };
    return icons[activityName] || 'help_outline'; // Default icon
  }
  

  // Method to handle sign out
  signOut() {
this.authService.logout();
  }
}
