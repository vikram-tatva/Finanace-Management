import { Component } from '@angular/core';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Registration, User } from '../../../../common/models/expenses.model';
import { ForgotPasswordDialogComponent } from '../forgot-password-dialog/forgot-password-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { response } from 'express';
import Clarity from '@microsoft/clarity';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  showLinebar = false;
  constructor(private fb: FormBuilder, 
    private dailog:MatDialog,private apiService: ApiServiceService, private snackBar: MatSnackBar, private router: Router) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$')
      ]]
    });
  }

  onSubmit() {
    this.isLoading = true

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.apiService.loginUser().subscribe({
        next: (register: Registration[]) => {
          const user = register.find(user => user.email === email && user.password === password);
          if (user) {
            //Add custome user id
            var date = new Date();
            var customUserId = user.id+ '-' + date.toLocaleDateString() + '-' + date.toLocaleTimeString();
            console.log(customUserId.toString());
            Clarity.identify(customUserId.toString(), date.toLocaleString().toString());

            const loggedInUser = new User(email, user.id, user.firstName, user.Lastname);
            localStorage.setItem("user", JSON.stringify(loggedInUser));
            this.snackBar.open('Login Successful', 'Close', { duration: 3000 });
            this.isLoading = false;
            this.router.navigate(['/admin']);
          } else {
            this.isLoading = false;
            this.snackBar.open('Invalid email or password', 'Close', { duration: 3000 });
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error during login', err);
          this.snackBar.open('Login failed', 'Close', { duration: 3000 });
        }
      });
    }
  }
  openForgotPasswordDialog(): void {
    const dialogRef = this.dailog.open(ForgotPasswordDialogComponent, {
      width: '400px',
      data: { email: this.loginForm.get('email').value }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      this.apiService.loginUser().subscribe({
        next:(response:Registration[])=>{
          const user = response.find(user => user.email === result.email && user.password === result.oldPassword);
          if(user){
            user.password=result.newPassword;
            this.apiService.forgotPassword(user).subscribe({
              next:(response:Registration)=>{
                this.snackBar.open("Forgot Password Successfull","Close",{duration:3000})
              },
              error:err=>{
                this.snackBar.open("Something Went Wrong","Close",{duration:3000})
                
              }
            })
    

          }
          else{
            this.snackBar.open("Email Is Not Found","Close",{duration:3000})

          }

        },
        error:err=>{
          this.snackBar.open("Something Went Wrong","Close",{duration:3000})

        }
      })
      console.log(result)
    });
  }

}
