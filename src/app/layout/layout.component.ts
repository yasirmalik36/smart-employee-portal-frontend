import { CommonModule } from '@angular/common';
import { Component, ElementRef, Renderer2, OnInit, OnDestroy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink,RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  isUserMenuOpen = false;

  isCollapsed = false;
  profilePopupVisible: boolean = false;
  private clickListener!: (() => void);

  constructor(private router: Router, private renderer: Renderer2, private elRef: ElementRef) {}

  ngOnInit() {
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
  }

  // Close the profile popup
  closeProfilePopup() {
    this.profilePopupVisible = false;
  }

  // Method to handle sign out
  signOut() {
    // Implement your sign-out logic here (e.g., clearing tokens, etc.)
    this.router.navigate(['/account/login']); // Redirect to login
  }
}
