
import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../../account/auth.service';
import { ToastService } from '../../shared/components/services/toaster.service';
@Injectable({
providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private alertMessage: ToastService ) {}

canActivate(
route: ActivatedRouteSnapshot,
state: RouterStateSnapshot
): boolean {
  
const isLoggedIn = this.authService.isLoggedIn();

  if (!isLoggedIn) {
 this.router.navigate(['/account/login']);
//this.alertMessage.showError("Please Login First!");

return false;
}
return true;
 }
}
