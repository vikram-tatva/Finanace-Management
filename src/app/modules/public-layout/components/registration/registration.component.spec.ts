import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RegistrationComponent } from './registration.component';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { Observable, of, throwError } from 'rxjs'; // Import throwError from RxJS
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('RegistrationComponent', () => {
  let component: RegistrationComponent;
  let fixture: ComponentFixture<RegistrationComponent>;
  let apiServiceMock: Partial<ApiServiceService>;
  let snackBarMock: Partial<MatSnackBar>;
  let routerMock: Partial<Router>;

  beforeEach(async () => {
    apiServiceMock = {
      checkEmailExists: jest.fn(),
      registrationUser: jest.fn(),
      postAccount: jest.fn()
    };

    snackBarMock = {
      open: jest.fn()
    };

    routerMock = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule,HttpClientTestingModule,RegistrationComponent,NoopAnimationsModule ],
      providers: [
        { provide: ApiServiceService, useValue: apiServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call API service to check if email exists on email change', () => {
    const mockEmail = 'test@example.com';
    const mockResponse = false; // Example response when email doesn't exist

    (apiServiceMock.checkEmailExists as jest.Mock).mockReturnValue(of(mockResponse));

    component.registerForm.get('email')!.setValue(mockEmail);
    component.onEmailChange();

    expect(apiServiceMock.checkEmailExists).toHaveBeenCalledWith(mockEmail);
    expect(component.emailExists).toEqual(mockResponse);
  });

  it('should handle registration successfully', () => {
    const mockRegistrationData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'Password123'
    };
  
    const mockRegistrationResponse = {
      id: '1234567890'
    };
  
    (apiServiceMock.checkEmailExists as jest.Mock).mockReturnValue(of(false));
    (apiServiceMock.registrationUser as jest.Mock).mockReturnValue(of(mockRegistrationResponse));
  
    component.registerForm.patchValue(mockRegistrationData);
    component.onSubmit();
    expect(apiServiceMock.registrationUser).toHaveBeenCalledWith(mockRegistrationData);
    expect(apiServiceMock.postAccount).toHaveBeenCalledWith({
      name: 'Default Account',
      balnce: 1000,
      userId: mockRegistrationResponse.id
    });
  });
  it('should handle registration failure', () => {
    const mockRegistrationData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      password: 'Password123'
    };
    (apiServiceMock.checkEmailExists as jest.Mock).mockReturnValue(of(false));
    (apiServiceMock.registrationUser as jest.Mock).mockReturnValue(throwError('Registration failed'));
    component.registerForm.patchValue(mockRegistrationData);
    component.onSubmit();
    expect(apiServiceMock.registrationUser).toHaveBeenCalledWith(mockRegistrationData);
  });
});
