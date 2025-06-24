import { CommonModule } from '@angular/common';
import { Component, ElementRef, Renderer2, OnInit, OnDestroy, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { Activity } from '../models/Activity';
import { MaterialModule } from '../shared/material module/material.module';
import { CommonService } from '../common/services/common.service';
import { encryptText } from '../common/export functions/customfunctions';
import { AuthService } from '../account/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterModule, ReactiveFormsModule, CommonModule, MaterialModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  activities: Activity[] = [];
  isCollapsed = false;
  profilePopupVisible = false;
  fullName = '';
  Designation = '';
  gender = '';

  private router = inject(Router);
  private renderer = inject(Renderer2);
  private elRef = inject(ElementRef);
  private authService = inject(AuthService);
  public common = inject(CommonService);

  isUserMenuOpen = this.common.isDropdownOpen; // Reactive Signal
  employeeId: any;
  ProfilePic: string='';
  profiletype!: string;

  constructor() {}

  ngOnInit() {
    // Load activities from local storage
    const storedActivities = localStorage.getItem('activites');
    if (storedActivities) {
      this.activities = JSON.parse(storedActivities) as Activity[];
    }
    this.ProfilePic = localStorage.getItem('profilePic') ?? '';
    this.fullName = this.authService.getFullNameFromToken();
    this.Designation = this.authService.getDesignationFromToken();
    this.gender = this.authService.getGenderFromToken();
    this.employeeId = this.authService.getUserId();
    document.addEventListener('click', this.handleOutsideClick.bind(this));
      this.profiletype = this.authService.getProfileType();

  }

  ngOnDestroy() {
    // Remove event listener to avoid memory leaks
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  }

  // Toggle the user dropdown menu
  toggleUserMenu(event: Event) {
    event.stopPropagation(); // Prevent event from bubbling up
    this.common.toggleDropdown();
  }


  handleOutsideClick(event: Event) {
    if (this.isUserMenuOpen()) { // Check signal state
      this.common.closeDropdown();
    }
  }
  // Toggle the profile popup
  toggleProfilePopup() {
    this.profilePopupVisible = !this.profilePopupVisible;
  }

  // Close the profile popup and user dropdown
  closeProfilePopup() {
    this.profilePopupVisible = false;
    this.common.closeDropdown();
  }

  // Toggle the sidebar
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    this.common.toggleSidebar();
  }

  // Get material icons for menu items
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
    return icons[activityName] || 'help_outline';
  }
  ViewMyEProfile(): void {
    const queryParams = { mode: 'view', id: this.employeeId.toString() };
    const encryptedParams = encryptText(JSON.stringify(queryParams));
  
    this.router.navigate(['/home/employee-profile'], {
      queryParams: { params: encryptedParams },
    });
  }
  isNotificationsOpen = false;
  notifications = [
    { title: 'New message from HR', time: '5 min ago' },
    { title: 'Task deadline approaching', time: '30 min ago' },
    { title: 'Meeting scheduled at 3 PM', time: '1 hour ago' },
    { title: 'Project update available', time: '2 hours ago' },
    { title: 'System maintenance alert', time: 'Yesterday' }
  ];

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
  }
  
  clearNotifications() {
    this.notifications = [];
  }

  viewAllNotifications() {
    console.log('Redirecting to notifications page');
    // Add navigation logic here
  }  signOut() {
    this.authService.logout();
  }
}
