import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ForgotPasswordDialogComponent } from './forgot-password-dialog.component';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { CommonModule } from '@angular/common';

describe('ForgotPasswordDialogComponent', () => {
  let component: ForgotPasswordDialogComponent;
  let fixture: ComponentFixture<ForgotPasswordDialogComponent>;
  let dialogRefSpy: jest.Mocked<MatDialogRef<ForgotPasswordDialogComponent>>;

  beforeEach(async () => {
    const dialogRefSpyObj = {
      close: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MaterialModule,
        NoopAnimationsModule,
        CommonModule,
        ForgotPasswordDialogComponent  // Import the standalone component
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { email: 'test@example.com' } },
        { provide: MatDialogRef, useValue: dialogRefSpyObj }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordDialogComponent);
    component = fixture.componentInstance;
    dialogRefSpy = TestBed.inject(MatDialogRef) as jest.Mocked<MatDialogRef<ForgotPasswordDialogComponent>>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).not.toBeFalsy();
  });

  it('should have an invalid form when fields are empty', () => {
    component.forgotPasswordForm.controls['email'].setValue('');
    component.forgotPasswordForm.controls['oldPassword'].setValue('');
    component.forgotPasswordForm.controls['newPassword'].setValue('');
    expect(component.forgotPasswordForm.invalid).toBeTruthy();
  });

  it('should have a valid form when fields are filled correctly', () => {
    component.forgotPasswordForm.controls['email'].setValue('test@example.com');
    component.forgotPasswordForm.controls['oldPassword'].setValue('OldPassword123');
    component.forgotPasswordForm.controls['newPassword'].setValue('NewPassword123');
    expect(component.forgotPasswordForm.valid).toBeTruthy();
  });

  it('should call dialogRef.close with form data on submit', () => {
    component.forgotPasswordForm.controls['email'].setValue('test@example.com');
    component.forgotPasswordForm.controls['oldPassword'].setValue('OldPassword123');
    component.forgotPasswordForm.controls['newPassword'].setValue('NewPassword123');
    component.onSubmit();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      email: 'test@example.com',
      oldPassword: 'OldPassword123',
      newPassword: 'NewPassword123'
    });
  });

  it('should call dialogRef.close on cancel', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });
});
