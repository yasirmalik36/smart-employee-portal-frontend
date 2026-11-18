import { Component, HostBinding, inject, Renderer2, signal } from '@angular/core';
import { MaterialModule } from '../../../../shared/material module/material.module';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { CommonService } from '../../../../common/services/common.service';
import { FaceRecognitionConfigComponent } from '../face-recognition-config/face-recognition-config.component';
import { Router, NavigationEnd, Event as RouterEvent, RouterOutlet, RouterLink } from '@angular/router';
import { ToastService } from '../../../../shared/components/services/toaster.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../../account/services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MaterialModule,RouterLink, FormsModule,RouterOutlet], // Add FormsModule
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  
})
export class SettingsComponent {
  @HostBinding('class') className = '';
  private toastService = inject(ToastService);
  private authservice = inject(AuthService);
  private renderer = inject(Renderer2);
  public common = inject(CommonService);
  //private router = inject(Router);
  private dialog = inject(MatDialog);

  isMobile = false;
  isDarkMode = false;
  fontSize = 'medium';
  language = 'en';
  notificationsEnabled = true;
  faceRecognitionEnabled = false;
  TableHeight = signal<string>("100px");
  isFaceConfigRouteActive: boolean=false;

  constructor(
    private breakpointObserver: BreakpointObserver,private router: Router
  ) {
    window.addEventListener('resize', () => this.updateHeight());
    this.updateHeight(); // Initial call
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isMobile = result.matches;
    });
  }
 ngOnInit(): void {
    this.router.events.pipe(
      filter((event: RouterEvent) => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const navigationEndEvent = event as NavigationEnd; // Type assertion
      this.isFaceConfigRouteActive = navigationEndEvent.urlAfterRedirects.includes('/home/settings/face-config');
    });
  }
  updateHeight() {

    this.TableHeight.set(this.computeHeight());
  }
  
  computeHeight(): string {
    const screenHeight = window.innerHeight;
  
    if (screenHeight <= 768) return 'calc(100vh - 161px)';     // Small Laptop
    else if (screenHeight <= 900) return 'calc(100vh - 165px)'; // MacBook / HD Laptop
    else if (screenHeight <= 1080) return 'calc(100vh - 200px)'; // Full HD
    else return 'calc(100vh - 230px)';                          // 2K and above
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
  openFaceRecognitionConfig(): void {
    this.dialog.open(FaceRecognitionConfigComponent, {
      width: '600px',
      // Other configuration options
    });
  }
}