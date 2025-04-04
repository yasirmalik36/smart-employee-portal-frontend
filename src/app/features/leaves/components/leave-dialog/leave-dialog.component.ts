import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MaterialModule } from '../../../../shared/material module/material.module';

@Component({
  selector: 'app-leave-dialog',
  standalone: true,
  imports: [FormsModule, MaterialModule],
  templateUrl: './leave-dialog.component.html',
  styleUrls: ['./leave-dialog.component.css'],
})
export class LeaveDialogComponent {
  leaveTypes: string[] = ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Unpaid Leave'];

  constructor(
    public dialogRef: MatDialogRef<LeaveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}