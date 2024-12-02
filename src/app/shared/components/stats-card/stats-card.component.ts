import { Component, Input } from '@angular/core';
import { MaterialModule } from '../../material module/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [MaterialModule,CommonModule],
  templateUrl: './stats-card.component.html',
  styleUrl: './stats-card.component.css'
})

export class StatsCardComponent {
  @Input() icon!: string;
  @Input() count!: number;
  @Input() title!: string;
  @Input() colorClass: string = ''; // Initialize with an empty string
}