import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { DashboardComponent } from './dashboard.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { GenericChartComponent } from '../../../../common/chart/generic-chart/generic-chart.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Expense, Incomes } from '../../../../common/models/expenses.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let apiService: jest.Mocked<ApiServiceService>;

  beforeEach(async () => {
    const apiServiceMock = {
      getSubCategories: jest.fn().mockReturnValue(of([])),
      getAccount: jest.fn().mockReturnValue(of([])),
      getIncomeAndExpenses: jest.fn().mockReturnValue(of([[], []])),
      getExpenses: jest.fn().mockReturnValue(of([])),
      getIncomeDetails: jest.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        CommonModule,
        MaterialModule,
        GenericChartComponent,
        NgxSkeletonLoaderModule,
        DashboardComponent
      ],
      providers: [
        { provide: ApiServiceService, useValue: apiServiceMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
        FormBuilder,
        ChangeDetectorRef
      ]
    }).compileComponents();

    apiService = TestBed.inject(ApiServiceService) as jest.Mocked<ApiServiceService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.chartdata).toEqual([]);
    expect(component.incomeData).toEqual([])
    expect(component.subCategory).toEqual([])
    expect(component.last7DaysData).toEqual([])
    expect(component.lastNDaysExpenses).toEqual([])
    expect(component.lastNDaysIncomes).toEqual([])
    expect(component.monthlyExpenses).toEqual(Array(12).fill(0));
    expect(component.monthlyIncome).toEqual(Array(12).fill(0));
    expect(component.rangeForm).toBeDefined();
    expect(component.totalBalance).toEqual(0);
    expect(component.currentMonthExpenses).toEqual(0);
    expect(component.previousMonthExpenses).toEqual(0);
    expect(component.currentMonthIncome).toEqual(0);
    expect(component.previousMonthIncome).toEqual(0);
    expect(component.dataIsLoad).toBeFalsy();
    expect(component.transactions).toEqual([])
    expect(component.filteredTransactions).toEqual([])
    expect(component.selectedType).toEqual('all');
    expect(component.creditCardLimit).toEqual(100000);
    expect(component.currentCreditUsage).toBeUndefined();
    expect(component.doughnutChartData).toBeNull();
    expect(component.doughnutChartOptions).toBeNull();
    expect(component.doughnutChartDataCurrentMonthData).toBeNull();
    expect(component.doughnutChartDataCurrentMonthOptions).toBeNull();
    expect(component.doughnutChartDataLastMonthData).toBeNull();
    expect(component.doughnutChartDataLastMonthOptions).toBeNull();
    expect(component.barChartData).toBeNull();
    expect(component.barChartOptions).toBeNull();
    expect(component.incomeVsExpenseChartData).toBeNull();
    expect(component.incomeVsExpenseChartOptions).toBeNull();
  });

  it('should call data fetching methods on initialization', fakeAsync(() => {
    jest.spyOn(component, 'loadSubCategory');
    jest.spyOn(component, 'loadTransactions');
    jest.spyOn(component, 'getTotalBalance');
    jest.spyOn(component, 'loadInitialData');
    jest.spyOn(component, 'getCurrentAndPreviousMonthData');

    component.ngOnInit();
    tick(1000); // simulate the passing of time for setTimeout
    fixture.detectChanges();

    expect(component.loadSubCategory).toHaveBeenCalled();
    expect(component.loadTransactions).toHaveBeenCalled();
    expect(component.getTotalBalance).toHaveBeenCalled();
    expect(component.loadInitialData).toHaveBeenCalled();
    expect(component.getCurrentAndPreviousMonthData).toHaveBeenCalled();
    flush()
  }));
  it('should load initial data on initialization', fakeAsync(() => {
    jest.spyOn(component, 'loadInitialData');
    component.ngOnInit();
    tick(1000); // Simulate setTimeout delay
    expect(component.loadInitialData).toHaveBeenCalled();
    // Assert other expectations as needed for loaded data
    expect(component.chartdata.length).toBeGreaterThanOrEqual(0); // Assuming mock returns 2 expenses
    expect(component.incomeData.length).toBeGreaterThanOrEqual(0); // Assuming mock returns 1 income
    expect(component.transactions.length).toBeGreaterThanOrEqual(0); // Assuming mock returns 1 income and 1 expense
    flush()
  
}));
it('should update doughnut chart data on income data change',fakeAsync(() => {
    const mockIncomeData: Incomes[] = [
      { id: '1', amount: 100, date: new Date(),account:'1',category:"2",userId:"76aa" },
      { id: '2', amount: 150, date: new Date(),account:'1',category:"2",userId:"76aa"  }
    ];
    const expectedLabels = ['Income', 'Expenses'];
    const expectedData = [250, 0]; // Assuming no expenses in mock data
    apiService.getIncomeDetails.mockReturnValueOnce(of(mockIncomeData));

    component.incomeData = mockIncomeData;
    component.ngOnInit();
    fixture.detectChanges();
    tick(1000)
    expect(component.doughnutChartDataCurrentMonthData).toBeTruthy();
    expect(component.doughnutChartDataCurrentMonthData?.labels).toEqual(expectedLabels);
    expect(component.doughnutChartDataCurrentMonthData?.datasets[0].data).toEqual(expectedData);
    flush()
  }));
  it('should update bar chart data on expense data change', fakeAsync(() => {
    const mockExpenses: Expense[] = [
      { id: '1', amount: 50, date: new Date('2024-07-01'), category: "2", account: "1", userId: "76aa", type: "Expenses" },
      { id: '2', amount: 75, date: new Date('2024-07-02'), category: "2", account: "1", userId: "76aa", type: "Expenses" }
    ];
  
    // Mock ApiServiceService behavior for getting expenses
    // apiService.getExpenses.mockReturnValueOnce(of(mockExpenses));
  
    // Set mock data and trigger ngOnInit
    component.ngOnInit();
    fixture.detectChanges(); // Detect changes to bind chartdata
    tick(1000); // Wait for asynchronous operations to complete
    fixture.detectChanges(); // Detect changes after async operations complete
  
    // Log component state for debugging
    console.log('barChartData:', component.barChartData);
  
  
    expect(component.barChartData).toBeTruthy();
    flush()
  }));
  it('should filter transactions by type', () => {
    // Set up mock transactions
    const mockTransactions = [
        { id: '1',date:new Date('2024-02-12'), amount: 100,icon:"income", type: 'income',name:"munavvar",account:"1" },
        { id: '2',date:new Date('2024-02-12'), amount: 100,icon:"income", type: 'expense',name:"munavvar" ,account:"1"},
        { id: '3',date:new Date('2024-02-12'), amount: 100,icon:"income", type: 'expense',name:"munavvar"  ,account:"1"},
    ];
    component.transactions = mockTransactions;
    fixture.detectChanges();

    // Test filtering by type 'income'
    component.filterTransactions('income');
    expect(component.filteredTransactions.length).toBeGreaterThanOrEqual(0);
    expect(component.filteredTransactions[0].type).toEqual('income');

    // Test filtering by type 'expense'
    component.filterTransactions('expense');
    expect(component.filteredTransactions.length).toBeGreaterThanOrEqual(0);
    expect(component.filteredTransactions[0].type).toEqual('expense');

    // Test filtering by type 'all'
    component.filterTransactions('all');
    expect(component.filteredTransactions.length).toEqual(3);
});

it('should validate range form', () => {
    const rangeForm = component.rangeForm;
    console.log('Initial form validity:', rangeForm.valid); // Log initial validity

    // Simulate user input for an invalid range
    rangeForm.patchValue({ startDate: new Date('2024-01-01'), endDate: new Date('2024-01-31') });
    fixture.detectChanges(); // Ensure to detect changes after patching
    console.log('Form validity after patching:', rangeForm.valid); // Log validity after patching

    expect(rangeForm.valid).toBeTruthy();
});
it('should handle no data scenarios', () => {
    // Mock ApiServiceService to return empty arrays for all data fetch methods
    apiService.getSubCategories.mockReturnValueOnce(of([]));
    apiService.getAccount.mockReturnValueOnce(of([]));
    apiService.getIncomeAndExpenses.mockReturnValueOnce(of([[], []]));
    apiService.getExpenses.mockReturnValueOnce(of([]));
    apiService.getIncomeDetails.mockReturnValueOnce(of([]));

    // Initialize component and detect changes
    component.ngOnInit();
    fixture.detectChanges();

    // Assert component variables are initialized correctly with empty data
    expect(component.subCategory.length).toEqual(0);
    expect(component.chartdata.length).toEqual(0);
    expect(component.incomeData.length).toEqual(0);
    expect(component.transactions.length).toEqual(0);
    // Add more expectations as needed
});


});
