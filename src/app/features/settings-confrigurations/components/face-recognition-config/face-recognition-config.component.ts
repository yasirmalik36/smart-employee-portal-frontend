import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../../shared/material module/material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../shared/components/services/toaster.service';
import { CommonService } from '../../../../common/services/common.service';
import { SettingsService } from '../../services/setting.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { AddFaceConfigComponent } from '../add-face-config/add-face-config.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

interface EmployeeFace {
  EmployeeID: number;
  EmployeeName: string;
  DateOfBirth: string;
  Designation: string;
  Department: string;
  HasFaceSaved: number;
  ImagePath: string;
  CreatedBy: string;
  CreatedDate: string;
  ModifiedBy: string;
  ModifiedDate: string;
  Gender: string;
  ProfilePic: string;
  [key: string]: any; // Allow dynamic access to properties
}

@Component({
  selector: 'app-face-recognition-config',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule],
  templateUrl: './face-recognition-config.component.html',
  styleUrl: './face-recognition-config.component.css',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
    trigger('rowAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateY(-20px)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class FaceRecognitionConfigComponent implements OnInit {
  private toastService = inject(ToastService);
  private settingService = inject(SettingsService);
  public common = inject(CommonService);
   private dialog=inject(MatDialog)
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource: MatTableDataSource<EmployeeFace> = new MatTableDataSource<EmployeeFace>([]);
  columns: any[] = [];
  displayedColumns: string[] = [];
  totalRecords = 0;
  pageSize = 10;
  pageNumber = 1;
  pageSizeOptions: number[] = [5, 10, 25, 50, 100];
  loading = false;
  employeeFaces: EmployeeFace[] = [];
  tableWidth = this.common.Tablewidth;
    TableHeight = signal<string>("100px");
  
  constructor(
  ) {
    window.addEventListener('resize', () => this.updateHeight());
    this.updateHeight(); // Initial call
  }


  ngOnInit(): void {
    this.getEmployeeFaces();
  }

  updateHeight() {

    this.TableHeight.set(this.computeHeight());
  }
  
  computeHeight(): string {
    const screenHeight = window.innerHeight;
  
    if (screenHeight <= 768) return 'calc(100vh - 284px)';     // Small Laptop
    else if (screenHeight <= 900) return 'calc(100vh - 165px)'; // MacBook / HD Laptop
    else if (screenHeight <= 1080) return 'calc(100vh - 200px)'; // Full HD
    else return 'calc(100vh - 230px)';                          // 2K and above
  }
  getEmployeeFaces() {
    this.loading = true;
    console.log('Fetching employee faces...');
    this.settingService.getEmployeeFaceDetails('0').subscribe(
      (response: any) => {
        console.log('API Response:', response);
        if (response?.resp?.code === '00' && response.employeeFaces) {
          this.employeeFaces = response.employeeFaces;
          this.totalRecords = parseInt(response.resp.totalRecords, 10) || 0;
          console.log('Employee Faces:', this.employeeFaces);
          this.prepareTableData([...this.employeeFaces]);
        } else {
          this.toastService.showError('Failed to fetch employee face details', response?.resp?.message || 'Something went wrong');
          this.dataSource.data = [];
        }
        this.loading = false;
        console.log('Loading set to false');
      },
      (error: any) => {
        console.error('Error fetching employee face details:', error);
        this.toastService.showError('Error fetching employee face details', error?.message || 'Please try again later.');
        this.loading = false;
        this.dataSource.data = [];
        console.log('Loading set to false (error)');
      }
    );
  }

  prepareTableData(data: EmployeeFace[]) {
    console.log('Data received in prepareTableData:', data);
    if (data?.length > 0) {
      const firstRecord = data[0];
      const excludedColumns = [ 'Gender', 'ProfilePic', , 'DateOfBirth', ];
      this.columns = Object.keys(firstRecord)
        .filter(key => !excludedColumns.includes(key))
        .map(key => {
          let columnDef = key;
          let width = '203px'; // Default width
          const parts = key.split('_');
          if (parts.length > 1 && !isNaN(parseInt(parts[parts.length - 1], 10))) {
            width = `${parts.pop()}px`;
            columnDef = parts.join('_');
          }
          const header = this.common.convertToTitleCase(columnDef);
          return {
            columnDef: columnDef,
            header: columnDef,
            width: width,
            cell: (row: EmployeeFace) => this.common.checkForNull(row[key]),
          };
        });

      // Add the 'actions' column at the beginning
      this.columns.unshift({ columnDef: 'actions', header: 'Actions', width: '120px' });

      this.displayedColumns = this.columns.map(col => col.columnDef);
      data.forEach((row: any) => {
        row.CreatedDate = this.common.DateandTimeMatFormatter(row.CreatedDate);
        row.ModifiedDate = this.common.DateandTimeMatFormatter(row.ModifiedDate);

      });
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      console.log('dataSource.data after assignment:', this.dataSource.data);
    } else {
      this.dataSource.data = [];
      this.columns = [];
      this.displayedColumns = [];
      console.log('No data to populate dataSource.');
    }
  }
    getEmployeeDetails(row: any) {
      return {
        name: row.EmployeeName,
        gender: row.Gender,
        dob: this.common.dateMatFormatter(row.DateOfBirth),
        designation:row.Designation,
        department:row.Department,
        image: this.common.getProfilePic(row.ProfilePic,row.Gender)
      };
    }
  onPageChange(event: PageEvent) {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.getEmployeeFaces(); // Re-fetch data on page change
  }

  addFace() {
    const dialogRef = this.dialog.open(AddFaceConfigComponent, {
      width: '670px', 
      height: '670px', 
      maxWidth: '90vw', 
      maxHeight: '90vh',
      disableClose: true,
      autoFocus: false,
      panelClass: 'custom-dialog' // Custom class for styling
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getEmployeeFaces();
      }
    });  }
    editFace(employeeId: number, ) {

      const dialogData = {
        employeeId: employeeId,
        isEdit: true, 
  
      };
      this.openAddEditFaceDialog(dialogData);
      // this.toastService.showInfo(`Edit functionality for Employee ID: ${employeeId}, Face ID: ${faceId} will be implemented.`);
    }
  
    private openAddEditFaceDialog(data?: any) {
      const dialogRef = this.dialog.open(AddFaceConfigComponent, {
        width: '670px',
        height: '670px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        disableClose: true,
        autoFocus: false,
        panelClass: 'custom-dialog', // Custom class for styling
        data: data // Pass data to the dialog component
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.getEmployeeFaces(); // Assuming this method refreshes the face list
        }
      });
    }
  otherAction() {
    this.toastService.showInfo('Other action functionality will be implemented here.');
  }



  deleteFace(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
            title: 'Delete Confirmation',
            message: 'Are you sure you want to delete the Face?',
            dialogType: 'delete',
            showCancelButton: true
        }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
            this.toastService.showSuccess(`Deleting employee with Employee Id: ${id}`);
            this.settingService.deleteFaceById(id).subscribe({
                next: (res) => {
                    if (res.code === '00') {
                        this.toastService.showSuccess(res.description || 'Face deleted successfully');
                        this.getEmployeeFaces();

                    } else {
                        this.toastService.showError(res.description || 'Failed to delete face');
                    }
                },
                error: (err) => {
                    this.toastService.showError('Error occurred while deleting face');
                    console.error(err);
                }
            });
        }
    });
}



}