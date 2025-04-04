import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { StatsCardComponent } from '../../shared/components/stats-card/stats-card.component';
import { LineChartComponent } from '../../shared/components/line-chart/line-chart.component';
import { DonutChartComponent } from '../../shared/components/donut-chart/donut-chart.component';
import { MaterialModule } from '../../shared/material module/material.module';
import { AuthService } from '../../account/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,MaterialModule, ReactiveFormsModule,StatsCardComponent, LineChartComponent, DonutChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'] // Fix to 'styleUrls' instead of 'styleUrl'
})
export class DashboardComponent {
  fullName!: string;
 constructor(private authservice:AuthService) {}

  ngOnInit() {
    debugger
    this.fullName = this.authservice.getFullNameFromToken();
  }

}
