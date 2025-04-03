import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, inject, Signal, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from '../../../../shared/components/services/toaster.service';
import { EmployeeService } from '../../service/employee.service';
import { CommonService } from '../../../../common/services/common.service';
import { MaterialModule } from '../../../../shared/material module/material.module';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../../account/auth.service';
import { decryptText } from '../../../../common/export functions/customfunctions';

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, MaterialModule],
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.css']
})
export class EmployeeProfileComponent {
  private route = inject(ActivatedRoute);
  private authservice = inject(AuthService);
  private toastService = inject(ToastService);
  private service = inject(EmployeeService);
  public common = inject(CommonService);
  public router = inject(Router);
  private dialog = inject(MatDialog);
  mode = signal<string | null>(null);
  employeeId = signal<number | null>(null);
  employeeForm: FormGroup;
  activeTab: number = 0;
  profileImage: string | ArrayBuffer | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;
  hidePassword: boolean = true; 
  genders = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
    { value: 'O', label: 'Other' },
  ];
  maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
  employmentTypes = ['Full-Time', 'Part-Time', 'Contract', 'Internship'];
  departmentName: string = 'IT'; // Replace with actual department name
  designationName: string = 'Software Engineer'; // Replace with actual designation name
  reportingManagerName: string = 'John Doe'; // Repl

  screenHeight = signal(window.innerHeight);

  constructor(private fb: FormBuilder) {   const encryptedParams$ = this.route.queryParamMap.pipe(map(params => params.get('params')));
    const encryptedParamsSignal = toSignal(encryptedParams$);

    if (encryptedParamsSignal()) {
      try {
        const decryptedParamsString = decryptText(encryptedParamsSignal()!);
        const decryptedParams = JSON.parse(decryptedParamsString);

        this.mode.set(decryptedParams.mode);
        if (decryptedParams.id) {
          this.employeeId.set(parseInt(decryptedParams.id, 10));
        }

      } catch (error) {
        console.error('Decryption error:', error);
        this.mode.set(null);
        this.employeeId.set(null);
      }
    }
  
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      personalEmail: [''],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      cnic: ['', [Validators.required, Validators.pattern('^[0-9]{13}$')]],
      gender: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],

      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      country: ['', [Validators.required]],
      maritalStatus: [''],
      numberOfDependents: [''],
      bloodGroup: ['', [Validators.required]],

      highestDegree: ['', [Validators.required]],
      institution: ['', [Validators.required]],
      yearOfGraduation: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
      major: ['', [Validators.required]],

      designationID: ['', [Validators.required]],
      departmentID: ['', [Validators.required]],
      joiningDate: ['', [Validators.required]],
      IsOnProbation: ['', [Validators.required]],
      ProbationEndDate: ['', [Validators.required]],
      shiftID: ['', [Validators.required]],
      employmentType: ['', [Validators.required]],
      workLocation: ['', [Validators.required]],
      reportingManagerID: ['', [Validators.required]],
      zipCode: [''],
      // password: ['',[Validators.required]],
      isActive: [true,[Validators.required]],
      medications: [''],
      healthCondition: [''],
      disabilityStatus: [''],
      emergencyContactName: ['', [Validators.required]],
      emergencyContactNumber: ['', [Validators.required]],
      emergencyContactRelationship: ['', [Validators.required]]
    });
  }
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword; // Toggle the visibility
  }
  TableHeight = computed(() => {
    return `calc(87vh - 0px)`;
  });

  tableWidth = this.common.Tablewidth;

  updateScreenHeight = () => this.screenHeight.set(window.innerHeight);

  ngOnInit() {
    if (this.employeeId()) {
      const empId = Number(this.employeeId());
      if (!isNaN(empId) && empId > 0 && (this.mode() === "view" || this.mode() === "edit")) {
        this.getEmployeeInfoByID(empId);
      }
    }
    window.addEventListener('resize', this.updateScreenHeight);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.updateScreenHeight);
  }

  setActiveTab(tabIndex: number): void {
    this.activeTab = tabIndex;
  }
  getEmployeeInfoByID(employeeID: number) {
    this.service.getEmployeeInfoByID({ employeeID }).subscribe(
      (response) => {
        if (response?.resp?.code === "00" && response.employeeData?.length > 0) {
          const employee = response.employeeData[0]; // Assuming single employee data is returned
          this.populateEmployeeForm(employee);
          this.profileImage = employee.ProfilePic ? `data:image/png;base64,${employee.ProfilePic}` : null;
        } else {
          console.warn("No employee data found.");
        }
      },
      (error) => {
        console.error("Error fetching employee data:", error);
      }
    );
  }
  
  submitForm() {
    if (this.employeeForm.valid) {
      let employeeData = {
        ...this.employeeForm.value,
        IsOnProbation: this.employeeForm.get('IsOnProbation')?.value === 'Yes' ? true : false,
      };
      if(this.mode() === "view" || this.mode() === "edit"){
        employeeData.employeeId=this.employeeId();
      }
      employeeData.ProfilePic=this.profileImage;
      if(this.mode() !== "add"){
        employeeData.profileID=3;
      }
      
      this.service.addUpdateEmployee(employeeData).subscribe({
        next: (response) => {
          if (response.code === '00') {
            this.toastService.showSuccess(response.description);
            if(this.mode() !== "view" || this.mode() === "edit"){
              employeeData.employeeId=this.employeeId();
            }
            if(this.mode() !== "view"){
              this.router.navigate(['/home/employee-management']);
            }
            } else {
            this.toastService.showError(response.description || 'Failed to save employee.');
          }
        },
        error: (err) => {
          if (err.status === 400 && err.error && err.error.errors) {
            this.handleValidationErrors(err.error.errors);
          } else {
            this.toastService.showError('An error occurred while saving employee data.');
          }
        }
      });
    } else {
      this.toastService.showError('Please fill all required fields.');
      this.markFormGroupTouched(this.employeeForm);
    }
  }
  private populateEmployeeForm(employee: any) {
    this.employeeForm.patchValue({
      firstName: employee.FirstName || '',
      lastName: employee.LastName || '',
      email: employee.Email || '',
      personalEmail: employee.Personal_Email || '',
      phone: employee.Phone || '',
      cnic: employee.CNIC || '',
      gender: employee.Gender || '',
      dateOfBirth: employee.DateOfBirth ? new Date(employee.DateOfBirth) : '',
      address: employee.Address || '',
      city: employee.City || '',
      state: employee.State || '',
      country: employee.Country || '',
      maritalStatus: employee.MaritalStatus || '',
      numberOfDependents: employee.Number_of_dependents || '',
      bloodGroup: employee.BloodGroup || '',
      highestDegree: employee.Highest_degree || '',
      institution: employee.Institution || '',
      yearOfGraduation: employee.Year_of_graduation || '',
      major: employee.Major || '',
      designationID: employee.DesignationID || '',
      departmentID: employee.DepartmentID || '',
      joiningDate: employee.JoiningDate ? new Date(employee.JoiningDate) : '',
      IsOnProbation: employee.IsOnProbation || false,
      ProbationEndDate: employee.ProbationEndDate ? new Date(employee.ProbationEndDate) : '',
      shiftID: employee.ShiftID || '',
      employmentType: employee.EmploymentType || '',
      workLocation: employee.WorkLocation || '',
      reportingManagerID: employee.ReportingManagerID || '',
      zipCode: employee.ZipCode || '',
      isActive: employee.IsActive || true,
      medications: employee.Medications || '',
      healthCondition: employee.Health_condition || '',
      disabilityStatus: employee.Disability_status || '',
      emergencyContactName: employee.Emergency_contact_name || '',
      emergencyContactNumber: employee.Emergency_contact_number || '',
      emergencyContactRelationship: employee.Emergency_contact_relationship || ''
    });
  }
  
  handleValidationErrors(errors: any): void {
    for (const field in errors) {
      if (this.employeeForm.get(this.camelToSnake(field))) {
        this.employeeForm.get(this.camelToSnake(field))?.setErrors({ serverError: errors[field].join(', ') });
      }
    }
  }

  camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  uploadImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  openCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();
          const canvas = document.createElement('canvas');
          canvas.width = 300;
          canvas.height = 300;
          video.addEventListener('loadedmetadata', () => {
            canvas.getContext('2d')?.drawImage(video, 0, 0, 300, 300);
            this.profileImage = canvas.toDataURL('image/png');
            stream.getTracks().forEach(track => track.stop());
          });
        })
        .catch(err => {
          this.toastService.showError('Camera access denied or not available.');
          console.error('Camera access error', err);
        });
    } else {
      this.toastService.showError('Your browser does not support camera access.');
    }
  }
  BackToParent() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
          title: 'Cancel Confirmation', 
          message: 'Are you sure you want close?', 
          dialogType: 'cancel', 
          showCancelButton: true
      }
  });

  dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.router.navigate(['/home/employee-management']);  // Navigate back to the parent component

      }
  });
  }

}