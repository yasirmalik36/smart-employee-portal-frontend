import { Component, HostBinding, Renderer2 } from '@angular/core';
import { MaterialModule } from '../../shared/material module/material.module';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FormsModule } from '@angular/forms'; // Import FormsModule

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule], // Add FormsModule
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent {
  @HostBinding('class') className = '';

  isMobile = false;
  isDarkMode = false;
  fontSize = 'medium';
  language = 'en';
  notificationsEnabled = true;
  faceRecognitionEnabled = false;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private renderer: Renderer2
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isMobile = result.matches;
    });
  }

  toggleTheme(isDarkMode: boolean): void {
    this.isDarkMode = isDarkMode;
    this.className = isDarkMode ? 'dark' : '';
    if (isDarkMode) {
      this.renderer.addClass(document.body, 'dark');
    } else {
      this.renderer.removeClass(document.body, 'dark');
    }
  }
}