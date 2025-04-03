import { Component, inject, ViewChild } from '@angular/core';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../../../shared/components/services/toaster.service';
import { EmployeeService } from '../../service/employee.service';
import { CommonService } from '../../../../common/services/common.service';
import { MaterialModule } from '../../../../shared/material module/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Column } from '../../../../models/coulmn';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AuthService } from '../../../../account/auth.service';
import { Router } from '@angular/router';
import { encryptText } from '../../../../common/export functions/customfunctions';

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, CommonModule],
  templateUrl: './employee-management.component.html',
  styleUrl: './employee-management.component.css'
})
export class EmployeeManagementComponent {

    response: any;
    columns: any[] = [];
    displayedColumns!: string[];
    users: any;
    dataSource!: MatTableDataSource<any>;
    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator | any;
    @ViewChild(MatSort, { static: false }) sort: MatSort | any;
    isFormVisible: boolean = false;
    Designation!: string;
    profiletype!: string;
    private toastService = inject(ToastService);
    private authservice = inject(AuthService);
    private service = inject(EmployeeService);
    public common = inject(CommonService);
    private router = inject(Router);

    constructor(private dialog: MatDialog) {}
    tableWidth = this.common.Tablewidth;
    TableHeight = this.common.TableHeight;
    ngOnInit() {
        this.Designation = this.authservice.getDesignationFromToken();
        this.profiletype = this.authservice.getProfileType();

        this.getEmployeeList();
    }

  
    getEmployeeList(): void {
      this.service.getEmployeeInfoByID().subscribe({
        next: (data: any) => {
          if (data && data.resp?.code === '00') {
            this.columns = [
              { columnDef: 'Sr', header: 'Sr', width: '70px', cell: (row: any) => `${row.Sr}` }, // Use the "Sr" from response
              { columnDef: 'edit', header: 'Edit', width: '70px' },
              { columnDef: 'reset', header: 'Reset ', width: '70px' },
              {
                columnDef: 'Employee_Name',
                header: 'Employee',
                width: '200px',
                cell: (row: any) => ({
                  name: row.FirstName + ' ' + row.LastName,
                  gender: row.Gender,
                  dob: row.DateOfBirth,
                  image: this.common.getProfilePic(row.ProfilePic,row.Gender)
                })
              },
              ...Object.keys(data.employeeData[0])
                .filter(key => ![
                  'Sr','EmployeeID', 'FirstName', 'LastName', 'DateOfBirth', 'Gender','CNIC' ,'Personal_Email',
                  'Address', 'City', 'State', 'ZipCode', 'Country', 'MaritalStatus', 'JoiningDate',
                  'DepartmentID', 'DesignationID', 'ShiftID', 'TeamID', 'Highest_degree', 'Institution',
                  'Year_of_graduation', 'Major', 'IsOnProbation', 'ProbationEndDate', 'EmploymentType',
                  'WorkLocation', 'ReportingManagerID', 'BloodGroup', 'Emergency_contact_name',
                  'Emergency_contact_number', 'Emergency_contact_relationship', 'Health_condition',
                  'Disability_status', 'Medications', 'Number_of_dependents', 'CreatedBy', 'CreatedDate',
                  'ModifiedBy', 'ModifiedDate', 'IsActive', 'IsDeleted', 'ProfilePic'
                ].includes(key))
                .map(key => ({
                  columnDef: key,
                  header: this.common.convertKeyToHeader(key),
                  width: '190px',
                  cell: (row: any) => `${row[key] ?? ''}` // Handle null values gracefully
                })),        
                { columnDef: 'delete', header: 'Delete', width: '70px' },


            ];
  
            this.users = data.employeeData;
            this.users.forEach((row: any) => {
              row.Last_Login = this.common.DateandTimeMatFormatter(row.Last_Login);
            });
            this.dataSource = new MatTableDataSource<any>(this.users);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.displayedColumns = this.columns.map(col => col.columnDef);
          } else {
            console.warn('No employee records found or error in response:', data?.resp?.message);
          }
        },
        error: (error: any) => {
          console.error('Error fetching employee info:', error);
        }
      });
    }
    /** Search Employees */
    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
        this.dataSource.filter = filterValue;
    }

  

    resetPassword(row: any) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Reset Password',
          message: 'Are you sure you want to reset the password?',
          dialogType: 'reset',
          showCancelButton: true 
        }
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if (result) { // User clicked 'Yes'
          const model = {
            employeeId: row.EmployeeID ,
            newPassword:  '', 
            oldPassword:  ''
          };
    
          this.service.resetPassword(model).subscribe((response: any) => {
            if (response.resp.code === '00') {
              this.getEmployeeList(); // Fetch updated employee list
    
              // Show the success message along with the generated password
              this.dialog.open(ConfirmDialogComponent, {
                data: {
                  title: 'Password Reset Successful',
                  message: `Password has been reset successfully.<br> 
              New Password: <strong class="password-text">${response.generatedPassword}</strong>`,
                  dialogType: 'reset',
                  showCancelButton: false // Hide the cancel button for alerts
                }
              });
            } else {
              this.toastService.showError(response.resp.description || 'Password reset failed.');
            }
          }, (error: any) => {
            this.toastService.showError(error.message || 'An error occurred while resetting the password.');
          });
        }
      });
    }
    
    /** Delete Employee */
    deleteEmployee(id: number) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Delete Confirmation', 
                message: 'Are you sure you want to delete the Employee?', 
                dialogType: 'delete', 
                showCancelButton: true
            }
        });

        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                console.log(`Deleting employee with ID: ${id}`);
                this.toastService.showSuccess(`Deleting employee with Employee Id: ${id}`)
                // Implement deletion logic here
            }
        });
    }

    /** Export to Excel */
    exportToExcel() {
        console.log("Exporting data to Excel...");
        // Implement export logic here
    }

    /** Open Add Employee Dialog */
    openAddEmployeeDialog() {

    }
    Addemployee() {
      const queryParams = { mode: 'add' };
      const encryptedParams = encryptText(JSON.stringify(queryParams));
    
      this.router.navigate(['/home/employee-profile'], {
        queryParams: { params: encryptedParams },
      });
    }
    
    editEmployee(employeeId: number): void {
      const queryParams = { mode: 'edit', id: employeeId.toString() };
      const encryptedParams = encryptText(JSON.stringify(queryParams));
    
      this.router.navigate(['/home/employee-profile'], {
        queryParams: { params: encryptedParams },
      });
    }
    getEmployeeDetails(row: any) {
      return {
        name: `${row.FirstName} ${row.LastName}`,
        gender: row.Gender,
        dob: this.common.dateMatFormatter(row.DateOfBirth),
        image: this.common.getProfilePic(row.ProfilePic,row.Gender)
      };
    }
}
