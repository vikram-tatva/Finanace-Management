import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { of } from 'rxjs';
import { ShowTransactionComponent } from './show-transaction.component';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { CommonServiceService } from '../../../../common/services/common-service.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ShowTransactionComponent', () => {
  let component: ShowTransactionComponent;
  let fixture: ComponentFixture<ShowTransactionComponent>;
  let apiService: ApiServiceService;
  let commonService: CommonServiceService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatPaginatorModule,
        MatDialogModule,
        MatSnackBarModule,
        NgxSkeletonLoaderModule,
        ShowTransactionComponent,
        HttpClientTestingModule
      ],
      providers: [
        ApiServiceService,
        CommonServiceService,
        FormBuilder
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowTransactionComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiServiceService);
    commonService = TestBed.inject(CommonServiceService);

    // Mocking necessary service methods
    jest.spyOn(apiService, 'getAccount').mockReturnValue(of([])); // Mock empty account response
    jest.spyOn(apiService, 'getSubCategories').mockReturnValue(of([])); // Mock empty subcategories response
    jest.spyOn(apiService, 'getExpenses').mockReturnValue(of([])); // Mock empty expenses response
    jest.spyOn(apiService, 'getIncomeDetails').mockReturnValue(of([])); // Mock empty income details response

    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.transactionData).toEqual([]);
    expect(component.filteredData).toEqual([]);
    expect(component.paginatedData).toEqual([]);
    expect(component.filterForm).toBeDefined();
    expect(component.pageSize).toEqual(10);
    expect(component.pageIndex).toEqual(0);
    expect(component.subCategory).toBeDefined(); // Initially undefined until API call completes
    expect(component.totalItems).toEqual(0);
    expect(component.dataIsLoad).toBeFalsy();
    expect(component.accountType).toBeDefined(); // Initially undefined until API call completes
    expect(component.showLinebar).toBeFalsy();
    expect(component.isLoading).toBeFalsy();
    expect(component.userId).toBeUndefined(); // Initially undefined until localStorage is mocked
    expect(component.paginator).toBeUndefined();
  });
  it('should initialize the form with default values', () => {
    const dateRangeGroup = component.filterForm.get('dateRange');
    expect(dateRangeGroup).toBeDefined();
    expect(dateRangeGroup.get('start').value).toEqual('');
    expect(dateRangeGroup.get('end').value).toEqual('');
    expect(component.filterForm.get('searchQuery').value).toEqual('');
  });
  it('should call data fetching methods on initialization', fakeAsync(() => {
    jest.spyOn(component, 'accountData');
    jest.spyOn(component, 'getSubcategory');
    jest.spyOn(component, 'fetchData');

    component.ngOnInit();
    tick(1000); // Simulate passage of time for setTimeout

    expect(component.accountData).toHaveBeenCalled();
    expect(component.getSubcategory).toHaveBeenCalled();
    expect(component.fetchData).toHaveBeenCalled();
    flush()
  }));
  it('should filter transactions based on form values', () => {
    // Mock some transaction data
    component.transactionData = [
      { id: 1, date: '2023-01-01', account: 'Bank', type: 'Expense', category: 'Food', amount: 100 },
      { id: 2, date: '2023-01-02', account: 'Cash', type: 'Income', category: 'Salary', amount: 200 }
    ];
  
    component.filterForm.setValue({
      dateRange: { start: '2023-01-01', end: '2023-01-02' },
      searchQuery: 'Bank'
    });
  
    component.applyFilter();
  
    expect(component.filteredData.length).toBe(1);
    expect(component.filteredData[0].account).toBe('Bank');
  });
  it('should paginate data correctly', () => {
    // Mock some filtered data
    component.filteredData = Array.from({ length: 25 }, (_, i) => ({ id: i, date: '2023-01-01', account: 'Bank', type: 'Expense', category: 'Food', amount: 100 }));

    component.pageSize = 10;
    component.pageIndex = 0;

    component.paginateData();

    expect(component.paginatedData.length).toBe(10);
    expect(component.paginatedData[0].id).toBe(0);
    expect(component.paginatedData[9].id).toBe(9);

    // Change page
    component.pageIndex = 1;
    component.paginateData();

    expect(component.paginatedData.length).toBe(10);
    expect(component.paginatedData[0].id).toBe(10);
    expect(component.paginatedData[9].id).toBe(19);
  });

});
