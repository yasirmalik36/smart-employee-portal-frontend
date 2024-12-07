import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}
@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,FormsModule ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})

export class UserManagementComponent   {

  constructor(){

  }
  ngOnInit() {
    this.filteredUsers();
 
}
searchTerm: string = '';

users: User[] = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'User', status: 'Inactive' },
  { id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', role: 'User', status: 'Active' },
  { id: 4, name: 'Bob Brown', email: 'bob.brown@example.com', role: 'Manager', status: 'Active' },
];


// Function to filter users based on the search term
 filteredUsers() {
  return this.users.filter((user) =>
    user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
  );
}

// Dummy function to handle "Add User" button click
addUser() {
  console.log('Add User button clicked');
}

// Dummy function to handle "Edit User" button click
editUser(id: number) {
  console.log('Edit user with id: ' + id);
}
}
