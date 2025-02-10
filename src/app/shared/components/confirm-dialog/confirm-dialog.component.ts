import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material module/material.module';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MaterialModule,CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css'] // Fix styleUrl to styleUrls
})
export class ConfirmDialogComponent {
  showCancelButton: boolean;
  dialogType: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; showCancelButton?: boolean; dialogType: string }
  ) {
    this.showCancelButton = data.showCancelButton !== undefined ? data.showCancelButton : true;
    this.dialogType = data.dialogType !== undefined ? data.dialogType : '';

  }
}
