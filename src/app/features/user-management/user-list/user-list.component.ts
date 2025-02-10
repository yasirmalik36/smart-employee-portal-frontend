import { Component, ComponentFactoryResolver, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { User, UserService } from '../user-service.service';
import { MaterialModule } from '../../../shared/material module/material.module';
import { UserFormComponent } from '../user-form/user-form.component';
import { Column } from '../../../models/coulmn';
import { CommonService } from '../../../common/services/common.service';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [MaterialModule,ReactiveFormsModule,CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})

export class UserListComponent implements OnInit {
  response: any;
  columns: Column[] = [];
  displayedColumns!: string[];
  users: any;
  dataSource!: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | any;
  @ViewChild(MatSort, { static: false }) sort: MatSort | any;
  isFormVisible: boolean= false;

  constructor(
    private userService: UserService,
    public common:CommonService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe((data: any) => {
  debugger
      this.columns = [
        { columnDef: 'action', header: 'Action', width: '120px' },
        ...Object.keys(data[0]).filter(key => !key.includes('user_ID')).map(key => ({
          columnDef: key,
          header: this.common.convertKeyToHeader(key),
          width: '220px', // You can update this if needed
          cell: (row: any) => `${row[key]}`,
        })), 

      ];
      this.users = data; 
      this.dataSource = new MatTableDataSource<any>(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.displayedColumns = this.columns.map(col => col.columnDef);
    });
  }
  
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
  }
  
  addUser() {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '800px',
      height: '700px',
      disableClose: false, // Prevents closing dialog on outside click
      data: null, // No ID passed for new user
      panelClass: 'custom-dialog', // Apply custom class
      position: {
        bottom: '0px',
        right: '0px'
      }
    });
  
    // Handle dialog close event
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('User added successfully', result);
        this.loadUsers(); // Refresh user list method
      }
    });
  }
  




  editUser(id: number) {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '600px',
      height: '600px',
      disableClose: false, // Prevents closing dialog on outside click
      data: { id }, // Pass the user ID to the dialog
      panelClass: 'custom-dialog', // Apply custom class
      position: {
        bottom: '0px',
        right: '0px'
      }
    });
  
    // Handle dialog close event
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('User added/edited successfully', result);
        this.loadUsers(); // Refresh user list method
      }
    });
  }
  
  exportData() {
    // Your export logic here
    console.log('Exporting data...');
  }

  generatePDF() {
    // Your PDF generation logic here
    console.log('Generating PDF...');
  }
  deleteUser(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Confirmation', 
        message: 'Are you sure you want to delete the User?', 
        dialogType: 'delete', 
        showCancelButton: true
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
      
      }
    });
  }
}
