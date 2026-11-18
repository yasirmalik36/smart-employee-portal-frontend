import { Component } from '@angular/core';
import { MaterialModule } from '../../shared/material module/material.module';
import { LoaderService } from '../services/Loader.service ';


@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css',
})
export class LoaderComponent {
  isLoading: boolean = false;
  constructor(public loader: LoaderService) {
    this.loader.isLoadingSubject.subscribe((x: any) => {
      this.isLoading = x;
    });
  }
}

