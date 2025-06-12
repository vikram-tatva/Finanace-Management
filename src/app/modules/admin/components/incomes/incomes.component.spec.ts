import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { IncomesComponent } from './incomes.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonServiceService } from '../../../../common/services/common-service.service';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

describe('IncomesComponent', () => {
  let component: IncomesComponent;
  let fixture: ComponentFixture<IncomesComponent>;
  let apiService: ApiServiceService;
  let snackBar: MatSnackBar;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        NoopAnimationsModule
      ],
      declarations: [IncomesComponent],
      providers: [
        FormBuilder,
        ApiServiceService,
        CommonServiceService,
        {
          provide: Router,
          useValue: { navigate: jest.fn() }
        }
      ]
    })
    .compileComponents(); // Ensure compilation after importing IncomesComponent
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomesComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiServiceService);
    snackBar = TestBed.inject(MatSnackBar);
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the component with correct values', () => {
    const userString = JSON.stringify({ id: '123' });
    localStorage.setItem('user', userString);

    jest.spyOn(apiService, 'getAccount').mockReturnValue(of([]));
    jest.spyOn(apiService, 'getSubCategories').mockReturnValue(of([]));

    component.ngOnInit();

    expect(component.userId).toBe('123');
    expect(apiService.getAccount).toHaveBeenCalledWith('123');
    expect(apiService.getSubCategories).toHaveBeenCalled();
  });

  it('should handle form submission and API calls correctly', async () => {
    // Set form values
    component.incomeForm.setValue({
      date: '2024-06-06',
      account: '1',
      category: '3c1a',
      amount: 100,
      userId: '123'
    });

    // Mock API responses
    interface PaymentType {
      id: string;
      name: string;
      balnce: number;
      userId: string;
    }

    const mockPayment: PaymentType = {
      id: '1',
      name: 'Savings',
      balnce: 100,
      userId: '123'
    };

    jest.spyOn(apiService, 'updateAccount').mockReturnValue(of(mockPayment));
    jest.spyOn(apiService, 'postIncomeDetails').mockReturnValue(of({} as any));
    jest.spyOn(router, 'navigate');
    jest.spyOn(snackBar, 'open');

    // Call onSubmit method
    await fixture.detectChanges(); // Detect changes before assertions
    await component.onSubmit();

    // Assertions
    expect(apiService.updateAccount).toHaveBeenCalled();
    expect(apiService.postIncomeDetails).toHaveBeenCalled();
    expect(snackBar.open).toHaveBeenCalledWith(
      "Income Details Are Updated Successfully!",
      "Close",
      { duration: 3000 }
    );
    expect(router.navigate).toHaveBeenCalledWith(['/admin/transactionData']);
  });

});