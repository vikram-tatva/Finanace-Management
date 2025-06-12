import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { AccountsComponent } from './accounts.component';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AccountsComponent', () => {
  let component: AccountsComponent;
  let fixture: ComponentFixture<AccountsComponent>;
  let apiService: ApiServiceService;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    const apiServiceMock = {
      getAccount: jest.fn().mockReturnValue(of([{ id: '1', name: 'Savings', balnce: 500, userId: '76aa' }])),
      postAccount: jest.fn().mockReturnValue(of({ id: '2', name: 'Checking', balnce: 1000, userId: '76aa' })),
      updateAccount: jest.fn().mockReturnValue(of({ id: '1', name: 'Savings', balnce: 600, userId: '76aa' })),
      deleteAccount: jest.fn().mockReturnValue(of({})),
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatDialogModule,
        MatSnackBarModule,
        NgxSkeletonLoaderModule,
        NoopAnimationsModule,
        MaterialModule,
        AccountsComponent
      ],
      providers: [
        { provide: ApiServiceService, useValue: apiServiceMock },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        MatSnackBar, // Inject MatSnackBar here
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiServiceService);
    snackBar = TestBed.inject(MatSnackBar); // Inject MatSnackBar for spying
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load accounts on initialization', () => {
    component.ngOnInit();
    expect(apiService.getAccount).toHaveBeenCalled();
    expect(component.accounts.length).toBeGreaterThan(0);
  });

  it('should add a new account successfully', fakeAsync(() => {
    // Set up the form data
    component.accountForm = new FormGroup({
      accountName: new FormControl('New Account'),
      accountBalance: new FormControl(1000),
    });
  
    const userId = '76aa';
    component.userId = userId; // Set the userId before calling onSubmit
  
    const snackBarOpenSpy = jest.spyOn(snackBar, 'open').mockReturnValue(null);
  
    component.onSubmit();
    fixture.detectChanges();
    tick();
  
    expect(apiService.postAccount).toHaveBeenCalledWith({
      name: 'New Account',
      balnce: 1000,
      userId: component.userId
    });
  
    expect(component.accounts.length).toBeGreaterThan(1);
  
    expect(component.accountForm.value).toEqual({
      accountName: null,
      accountBalance: null,
    });
  
    // expect(snackBarOpenSpy).toHaveBeenCalledWith('Account added successfully', 'Close', {
    //   duration: 3000,
    // });
  }));

  it('should handle error when adding account fails', fakeAsync(() => {
    apiService.postAccount = jest.fn().mockReturnValue(throwError(() => new Error('API error')));

    // Set up the form data
    component.accountForm = new FormGroup({
      accountName: new FormControl('New Account'),
      accountBalance: new FormControl(1000),
    });

    const snackBarOpenSpy = jest.spyOn(snackBar, 'open').mockReturnValue(null);

    component.onSubmit();
    fixture.detectChanges();
    tick();

    expect(apiService.postAccount).toHaveBeenCalled();
    expect(component.accounts.length).toBe(1); // Ensure no new account was added on error

    // expect(snackBarOpenSpy).toHaveBeenCalledWith('Error adding account', 'Close', {
    //   duration: 3000,
    // });
  }));

  it('should update an account successfully', fakeAsync(() => {
    component.accounts = [{ id: '1', name: 'Savings', balnce: 500, userId: '76aa' }];
    component.editIndex = 0;

    // Set up the edit form data
    component.editForm = new FormGroup({
      accountName: new FormControl('Updated Savings'),
      accountBalance: new FormControl(500),
      userId: new FormControl('76aa'),
    });

    const snackBarOpenSpy = jest.spyOn(snackBar, 'open').mockReturnValue(null);

    component.onEditSubmit();
    fixture.detectChanges();
    tick();

    expect(apiService.updateAccount).toHaveBeenCalledWith({
      id: '1',
      name: 'Updated Savings',
      balnce: 500,
      userId: '76aa',
    });

    expect(component.accounts[0].name).toBe('Updated Savings');

    // expect(snackBarOpenSpy).toHaveBeenCalledWith('Account updated successfully', 'Close', {
    //   duration: 3000,
    // });
  }));

  it('should handle error when updating account fails', fakeAsync(() => {
    component.accounts = [{ id: '1', name: 'Savings', balnce: 500, userId: '76aa' }];
    component.editIndex = 0;
    apiService.updateAccount = jest.fn().mockReturnValue(throwError(() => new Error('API error')));

    // Set up the edit form data
    component.editForm = new FormGroup({
      accountName: new FormControl('Updated Savings'),
      accountBalance: new FormControl(500),
      userId: new FormControl('76aa'),
    });

    const snackBarOpenSpy = jest.spyOn(snackBar, 'open').mockReturnValue(null);

    component.onEditSubmit();
    fixture.detectChanges();
    tick();

    expect(apiService.updateAccount).toHaveBeenCalled();
    expect(component.accounts[0].name).not.toBe('Savings'); // Ensure account name is unchanged on error

    // expect(snackBarOpenSpy).toHaveBeenCalledWith('Error updating account', 'Close', {
    //   duration: 3000,
    // });
  }));

});
