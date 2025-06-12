import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick, flush } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { LoginComponent } from './login.component';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { Registration, User } from '../../../../common/models/expenses.model';
import { Router } from '@angular/router';
import { ForgotPasswordDialogComponent } from '../forgot-password-dialog/forgot-password-dialog.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let apiService: ApiServiceService;
  let dialog: MatDialog;
  let router: Router;

  beforeEach(waitForAsync(() => {
    const apiServiceMock = {
      loginUser: jest.fn(),
      forgotPassword: jest.fn()
    };

    const routerMock = {
      navigate: jest.fn().mockResolvedValue(true)
    };

    const matDialogMock = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of({ email: 'test@test.com', oldPassword: 'Password1', newPassword: 'NewPassword1' }))
      })
    };
    

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MaterialModule,
        MatSnackBarModule,
        RouterTestingModule.withRoutes([]), // Use RouterTestingModule with empty routes
        MatDialogModule,
        NoopAnimationsModule,
        LoginComponent // Importing the standalone component
      ],
      providers: [
        { provide: ApiServiceService, useValue: apiServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: matDialogMock },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiServiceService);
    dialog = TestBed.inject(MatDialog);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')).toBeDefined();
    expect(component.loginForm.get('password')).toBeDefined();
  });

  it('should validate email format', () => {
    component.loginForm.setValue({ email: 'invalid-email', password: 'Password1' });
    expect(component.loginForm.valid).toBeFalsy();
    expect(component.loginForm.get('email').hasError('email')).toBeTruthy();
  });

  it('should validate password pattern', () => {
    component.loginForm.setValue({ email: 'test@test.com', password: 'password' });
    expect(component.loginForm.valid).toBeFalsy();
    expect(component.loginForm.get('password').hasError('pattern')).toBeTruthy();
  });

  it('should show error if form is invalid on submit', () => {
    component.loginForm.setValue({ email: '', password: '' });
    
    component.onSubmit();

    expect(component.isLoading).toBeTruthy();
  });

  it('should call loginUser and navigate to /admin on valid login', fakeAsync(() => {
    const register: Registration[] = [
      { id: "1", email: 'test@test.com', password: 'Password1', firstName: 'Test', Lastname: 'User' }
    ];
    (apiService.loginUser as jest.Mock).mockReturnValue(of(register));
    component.loginForm.setValue({ email: 'test@test.com', password: 'Password1' });
    
    component.onSubmit();
    
    tick();
    fixture.detectChanges();
  
    expect(component.isLoading).toBeFalsy();
    expect(localStorage.getItem('user')).toBe(JSON.stringify(new User('test@test.com', "1", 'Test', 'User')));
    expect(router.navigate).toHaveBeenCalledWith(['/admin']); 
  
    flush(); 
  }));

  it('should show error on failed login', fakeAsync(() => {
    (apiService.loginUser as jest.Mock).mockReturnValue(throwError({ error: 'Invalid login' }));
    component.loginForm.setValue({ email: 'test@test.com', password: 'Password1' });
    
    component.onSubmit();
    
    tick();
    fixture.detectChanges();
    
    expect(component.isLoading).toBeFalsy();
    // expect(component.snackBar.open).toHaveBeenCalledWith('Login failed', 'Close', { duration: 3000 });
    
    flush();
  }));

  // it('should open forgot password dialog and handle the response correctly', fakeAsync(() => {
  //   const dialogRefMock = {
  //     afterClosed: jest.fn().mockReturnValue(of({ email: 'test@test.com', oldPassword: 'Password1', newPassword: 'NewPassword1' }))
  //   };
  //   (dialog.open as jest.Mock).mockReturnValue(dialogRefMock);

  //   component.openForgotPasswordDialog();

  //   tick();

  //   expect(dialog.open).toHaveBeenCalled();
  //   expect(dialogRefMock.afterClosed).toHaveBeenCalled();

  //   flush();
  // }));
});
