import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { MaterialModule } from './shared/material module/material.module';
import { WebcamModule } from 'ngx-webcam';
import { LoaderComponent } from './common/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,LoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SmartEmployeePortalUI';
  
}
