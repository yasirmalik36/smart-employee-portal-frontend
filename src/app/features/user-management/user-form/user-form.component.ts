import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../shared/material module/material.module';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [MaterialModule,ReactiveFormsModule,CommonModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})

export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId!: number;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // Pass data from dialog
  ) {
    this.userForm = this.fb.group({
      employeeId: ['', Validators.required],
      userId: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      highestDegree: ['', Validators.required],
      institution: ['', Validators.required],
      yearOfGraduation: ['', Validators.required],
      major: ['', Validators.required],
      additionalCertifications: [''],
      languagesSpoken: [''],
      previousEmployer: [''],
      previousJobTitle: [''],
      hireDate: [''],
      probationPeriod: [''],
      employmentStatus: ['', Validators.required],
      jobTitle: ['', Validators.required],
      department: ['', Validators.required],
      teamName: ['', Validators.required],
      managerId: [''],
      salary: ['', Validators.required],
      employmentType: ['', Validators.required],
      workLocation: ['', Validators.required],
      workingHoursPerWeek: ['', Validators.required],
      contractStartDate: [''],
      contractEndDate: [''],
      bankAccountNumber: [''],
      bankName: [''],
      nationalId: [''],
      passportNumber: [''],
      financeNotes: [''],
      taxIdentificationNumber: [''],
      salaryAccountingCode: [''],
      refereeName: [''],
      refereeContact: [''],
      refereeRelationship: [''],
      emergencyContactName: [''],
      emergencyContactNumber: [''],
      emergencyContactRelationship: [''],
      healthCondition: [''],
      disabilityStatus: [''],
      medications: [''],
      createdDate: [''],
      updatedDate: [''],
      createdBy: [''],
      modifiedBy: [''],
      terminationDate: [''],
      exitReason: [''],
      rehireStatus: [''],
      workEmail: [''],
      personalEmail: [''],
      maritalStatus: [''],
      numberOfDependents: ['', Validators.required],
      socialSecurityNumber: [''],
      isActive: [false]
    });
  }

  ngOnInit(): void {
    if (this.data?.id) {
      this.isEditMode = true;
      this.userId = this.data.id;
      this.userService.getUserById(this.userId).subscribe(response => {
        if (response.statusCode === "00") {
          this.userForm.patchValue(response.employeeDetails); // Patch data from the user object to the form
          console.log("this.userForm", this.userForm);
        }
      });
    }
  }
  employeeImage: string | ArrayBuffer | null = null;

  closeDialog() {
    this.dialogRef.close();
  }
  uploadImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.employeeImage = reader.result;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }
   onSubmit(): void {
  //   if (this.userForm.valid) {
  //     const user = this.userForm.value;
  //     if (this.isEditMode) {
  //       // Update user
  //       this.userService.updateUser(user).subscribe(() => {
  //         this.snackBar.open('User updated successfully!', 'Close', { duration: 3000 });
  //         this.dialogRef.close(user); // Close dialog and return the updated user
  //       });
  //     } else {
  //       // Add new user
  //       this.userService.addUser(user).subscribe(() => {
  //         this.snackBar.open('User added successfully!', 'Close', { duration: 3000 });
  //         this.dialogRef.close(user); // Close dialog and return the newly created user
  //       });
  //     }
   // }
  }
}
