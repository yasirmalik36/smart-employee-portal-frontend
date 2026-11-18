import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { MaterialModule } from './shared/material module/material.module';
import { WebcamModule } from 'ngx-webcam';
import { LoaderComponent } from './common/loader/loader.component';
import { AlertBoxComponent } from './shared/components/alert-box/alert-box.component';
import { CommonService } from './common/services/common.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,LoaderComponent,AlertBoxComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'SmartEmployeePortalUI';
    public common = inject(CommonService);
  
}
