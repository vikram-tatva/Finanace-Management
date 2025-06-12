import { Component } from '@angular/core';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { PaymentType, Registration } from '../../../../common/models/expenses.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [MaterialModule,CommonModule,ReactiveFormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent {
  registerForm: FormGroup;
  emailExists: boolean = false;
  isLoading=false;
  showLinebar=false;
  constructor(
    private fb: FormBuilder,
    private apiService: ApiServiceService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$')
      ]]
        });
  }

  onEmailChange() {
    const emailControl = this.registerForm.get('email');
    if (emailControl?.valid) {
      this.apiService.checkEmailExists(emailControl.value).subscribe({
        next: (exists: boolean) => {
          this.emailExists = exists;
          if (exists) {
            emailControl.setErrors({ emailExists: true });
          } else {
            emailControl.setErrors(null);
          }
        },
        error: (err) => {
          console.error('Error checking email', err);
        }
      });
    }
  }

  onSubmit() {
    this.isLoading=true

    if (this.registerForm.valid && !this.emailExists) {
      this.apiService.registrationUser(this.registerForm.value).subscribe({
        next: (response: Registration) => {
          if (response) {
            const userId = response.id;
  
            const paymentType: PaymentType = {
              name: 'Default Account',
              balnce: 1000,
              userId: userId
            };
  
            this.apiService.postAccount(paymentType).subscribe({
              next: (accountResponse: PaymentType) => {
                this.snackBar.open('Registration Successful', 'Close', { duration: 3000 });
                this.isLoading=false;
                this.router.navigate(['/login']);
              },
              error: (err) => {
                this.isLoading=false;
                this.snackBar.open('Error creating account', 'Close', { duration: 3000 });
              }
            });
          }
        },
        error: (err) => {
          this.snackBar.open('Registration Unsuccessful', 'Close', { duration: 3000 });
        }
      });
    }
  }
  
}
