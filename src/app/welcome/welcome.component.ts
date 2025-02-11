import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PlayerService } from '../services/player.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
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
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
})
export class WelcomeComponent {
  userForm: FormGroup;
  isSubmitting = false;
  constructor(
    private fb: FormBuilder,
    private playerService: PlayerService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      console.warn('Form is invalid. Please check the fields.');
      return;
    }

    const { email } = this.userForm.value;

    console.log('Form submitted with email:', email);

    this.playerService.getUserDetailsByEmailId(email).subscribe({
      next: (response) => {
        if (response) {
          console.log('Owner details fetched:', response);
          if (response.userType.toLocaleLowerCase() === 'owner') {
            this.router.navigate(['/biddingprocess']);
            this.playerService.setSelectedOwnerSignal(response);
          } else if (response.userType.toLocaleLowerCase() === 'admin') {
            this.playerService.setIsAdminSignal();
            this.router.navigate(['/players']);
          }
        } else {
          console.warn('No owner found for the provided email.');
          // You can show a notification or error message to the user here.
        }
      },
      error: (error) => {
        console.error('Error fetching owner details:', error);
        // Optionally, display an error message to the user.
      },
    });
  }
}
