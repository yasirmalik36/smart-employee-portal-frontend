import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material module/material.module';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  imports: [CommonModule, FormsModule, MaterialModule],
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent {
  @Input() totalRecords: number = 0;
  @Input() pageSize: number = 25;
  @Input() currentPage: number = 1;
  @Input() showFirstLastButtons: boolean = true; // ✅ Make sure this exists

  @Output() pageChanged: EventEmitter<{ pageIndex: number, pageSize: number }> = new EventEmitter();

  onPageChange(event: PageEvent): void {
    debugger
    this.currentPage = event.pageIndex; 
    this.pageSize = event.pageSize;
    this.pageChanged.emit({ pageIndex: this.currentPage, pageSize: this.pageSize });
  }
  
}