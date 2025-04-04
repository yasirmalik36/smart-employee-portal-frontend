import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../../shared/material module/material.module';
import { LeaveService } from '../../services/leave.service';
import { LeaveDialogComponent } from '../leave-dialog/leave-dialog.component';

@Component({
  selector: 'app-leave-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './leave-management.component.html',
  styleUrls: ['./leave-management.component.css'],
})
export class LeaveManagementComponent implements OnInit {
  leaveTypes: string[] = ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Unpaid Leave'];
  leaveList: any[] = [];
  loading = false;
  leaveRequest = {
    leaveType: '',
    userID: 0,
    dateFrom: '',
    dateTo: '',
  };
  displayedColumns: string[] = ['userID', 'leaveType', 'startDate', 'endDate', 'status', 'reason', 'actions'];

  constructor(private leaveService: LeaveService, public dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.getLeaves();
  }

  getLeaves() {
    this.loading = true;
    this.leaveService.getLeaves(this.leaveRequest).subscribe(
      (data) => {
        this.leaveList = data;
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching leaves:', error);
        this.loading = false;
        this.snackBar.open('Error fetching leaves.', 'Close', { duration: 3000 });
      }
    );
  }

  openLeaveDialog(leave?: any) {
    const dialogRef = this.dialog.open(LeaveDialogComponent, {
      width: '500px',
      data: leave,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (leave) {
          this.leaveService.editLeave(result).subscribe(() => this.getLeaves());
        } else {
          this.leaveService.applyLeave(result).subscribe(() => this.getLeaves());
        }
      }
    });
  }

  approveLeave(leaveId: number) {
    this.leaveService.approveLeave(leaveId).subscribe(() => this.getLeaves());
  }

  rejectLeave(leaveId: number) {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.leaveService.rejectLeave(leaveId, reason).subscribe(() => this.getLeaves());
    }
  }
}