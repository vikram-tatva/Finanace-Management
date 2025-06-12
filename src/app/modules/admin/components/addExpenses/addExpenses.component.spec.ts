import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormArray, FormBuilder } from '@angular/forms';
import { AddExpensesComponent } from './addExpenses.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { CommonServiceService } from '../../../../common/services/common-service.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Expense } from '../../../../common/models/expenses.model';

describe('AddExpensesComponent', () => {
  let component: AddExpensesComponent;
  let fixture: ComponentFixture<AddExpensesComponent>;
  let apiService: ApiServiceService;
  let commonService: CommonServiceService;

  beforeEach(async () => {
    const apiServiceMock = {
      getSubCategories: jest.fn().mockReturnValue(of([{ id: '2', name: 'Food' }, { id: '2', name: 'Transport' }])),
      getAccount: jest.fn().mockReturnValue(of([{ id: '1', name: 'Cash', balnce: 1000 }])),
    };

    const commonServiceMock = {
      formatedDate: jest.fn().mockReturnValue('2023-06-26'),
      handleExpenses: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        MaterialModule,
        RouterTestingModule,
        MatDialogModule,
        NgxSkeletonLoaderModule,
        AddExpensesComponent, // Importing the standalone component here
      ],
      providers: [
        { provide: ApiServiceService, useValue: apiServiceMock },
        { provide: CommonServiceService, useValue: commonServiceMock },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddExpensesComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiServiceService);
    commonService = TestBed.inject(CommonServiceService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with one expense', () => {
    const expensesFormArray = component.expenses();
    expect(expensesFormArray.length).toBe(1);
  });

  it('should add a new expense form group when addExpense is called', () => {
    component.addExpense();
    const expensesFormArray = component.expenses();
    expect(expensesFormArray.length).toBe(2);
  });

  it('should remove an expense form group when removeExpense is called', () => {
    component.addExpense();
    let expensesFormArray = component.expenses();
    expect(expensesFormArray.length).toBe(2);

    component.removeExpense(0);
    expensesFormArray = component.expenses();
    expect(expensesFormArray.length).toBe(1);
  });

  it('should update total amount when expenses change', () => {
    component.addExpense();
    const expensesFormArray = component.expenses();

    expensesFormArray.at(0).patchValue({ amount: 100 });
    expensesFormArray.at(1).patchValue({ amount: 200 });

    component.updateTotalAmount();
    const totalAmount = component.expenseForm.get('totalAmount').value;
    expect(totalAmount).toBe(300);
  });

  it('should validate the balance correctly', () => {
    component.expenseForm.get('account').setValue('1');
    component.expenseForm.get('totalAmount').setValue(500);
    expect(component.validateBalance()).toBe(true);

    component.expenseForm.get('totalAmount').setValue(1500);
    expect(component.validateBalance()).toBe(false);
  });

  it('should transform form data into Expense array correctly', () => {
    component.expenseForm.patchValue({
      date: '2023-06-26',
      account: '1',
    });
    component.expenses().at(0).patchValue({ category: 'Food', amount: 100 });

    const expenses: Expense[] = component.transformExpenseData(component.expenseForm.value);
    expect(expenses.length).toBe(1);
    expect(expenses[0]).toEqual({
      type: 'expense',
      date: '2023-06-26',
      account: '1',
      category: 'Food',
      amount: 100,
    });
  });

  it('should handle form submission correctly', () => {
    component.expenseForm.patchValue({
      date: '2023-06-26',
      account: '1',
      totalAmount: 500
    });
    component.expenses().at(0).patchValue({ category: 'Food', amount: 500 });

    component.onSubmit();
    expect(commonService.handleExpenses).toHaveBeenCalled();
    expect(component.expenseForm.get('expenses').value.length).toBeGreaterThanOrEqual(1);
  });


  
});
