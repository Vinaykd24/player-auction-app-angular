import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-add-user',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
  ],
  templateUrl: './add-user.component.html',
  styleUrl: './add-user.component.scss',
})
export class AddUserComponent {
  userForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      userType: ['', Validators.required],
      teamName: [''],
      role: [''],
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      console.log('Form submitted:', this.userForm.value);
      if (this.userForm.valid) {
        this.isSubmitting = true;

        this.userService.createUser(this.userForm.value).subscribe({
          next: (response) => {
            this.snackBar.open('User created successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
            });
            this.resetForm();
          },
          error: (error) => {
            console.error('Error creating user:', error);
            this.snackBar.open(
              error.error.message || 'Failed to create user. Please try again.',
              'Close',
              {
                duration: 5000,
                horizontalPosition: 'right',
                verticalPosition: 'top',
              }
            );
          },
          complete: () => {
            this.isSubmitting = false;
          },
        });
      }
    }
  }

  resetForm() {
    this.userForm.reset();
    // Reset form validation states
    Object.keys(this.userForm.controls).forEach((key) => {
      const control = this.userForm.get(key);
      control?.setErrors(null);
      control?.markAsUntouched();
      control?.markAsPristine();
    });
  }
}
