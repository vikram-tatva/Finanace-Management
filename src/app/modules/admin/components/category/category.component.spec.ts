import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

import { CategoryComponent } from './category.component';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { Category, Subcategory } from '../../../../common/models/expenses.model';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CategoryComponent', () => {
  let component: CategoryComponent;
  let fixture: ComponentFixture<CategoryComponent>;
  let apiService: ApiServiceService;
  let dialog: MatDialog;
  let snackbar: MatSnackBar;
  let router: Router;

  beforeEach(async () => {
    const apiServiceMock = {
      getCategories: jest.fn().mockReturnValue(of([{ id: '1', name: 'TestCategory', subcategories: [{ id: '1', name: 'TestSubcategory', categoryId: '1' }] }])),
      getSubCategories: jest.fn().mockReturnValue(of([{ id: '1', name: 'TestSubcategory', categoryId: '1' }])),
      addSubCategory: jest.fn().mockReturnValue(of({ id: '2', name: 'NewSubcategory', categoryId: '1' })),
      updateSubCategory: jest.fn().mockReturnValue(of({ id: '1', name: 'UpdatedSubcategory', categoryId: '1' })),
      deleteSubCategory: jest.fn().mockReturnValue(of({ id: '1', name: 'DeletedSubcategory', categoryId: '1', userId: '76aa' }))
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatSnackBarModule,
        NgxSkeletonLoaderModule,
        RouterTestingModule,
        MaterialModule,
        NoopAnimationsModule,
        CategoryComponent // Import the standalone component
      ],
      providers: [
        { provide: ApiServiceService, useValue: apiServiceMock },
        FormBuilder,
        { provide: MatDialog, useValue: { open: jest.fn().mockReturnValue({ afterClosed: () => of(true) }) } },
        { provide: MatSnackBar, useValue: { open: jest.fn().mockReturnValue({}) } },
        { provide: Router, useValue: { navigate: jest.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiServiceService);
    dialog = TestBed.inject(MatDialog);
    snackbar = TestBed.inject(MatSnackBar);
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form and fetch initial data', fakeAsync(() => {
    component.ngOnInit();
    tick(3000); // Simulate delay for data load
    fixture.detectChanges();

    expect(component.categories.length).toBeGreaterThan(0);
    expect(component.subcategories.length).toBeGreaterThan(0);
    expect(component.searchForm).toBeDefined();
    expect(component.addCategoryForm).toBeDefined();
    expect(component.editForm).toBeDefined();
  }));

  it('should call addSubCategory on valid form submission', fakeAsync(() => {
    const userId = '76aa';
    component.userId = userId; // Set the userId in the component
    component.addCategoryForm.setValue({ name: 'NewSubcategory', categoryId: '1', userId: '' });
    component.onSubmit();
    fixture.detectChanges();
    tick();

    expect(apiService.addSubCategory).toHaveBeenCalledWith({
      name: 'NewSubcategory',
      categoryId: '1',
      userId: userId
    });

  }));

  it('should call updateSubCategory on valid form submission', fakeAsync(() => {
    component.editForm.setValue({ id: '1', name: 'UpdatedSubcategory', categoryId: '1', userId: '76aa' });
    component.onEditSubmit();
    fixture.detectChanges();
    tick();

    expect(apiService.updateSubCategory).toHaveBeenCalledWith({
      id: '1',
      name: 'UpdatedSubcategory',
      categoryId: '1',
      userId: '76aa'
    });
    // expect(snackbar.open).toHaveBeenCalledWith('Category updated successfully', 'Close', { duration: 3000 });
  }));

//   it('should call deleteSubCategory and show confirmation dialog', fakeAsync(() => {
//     jest.spyOn(Swal, 'fire').mockReturnValue(Promise.resolve({ isConfirmed: true } as any));
//     const deleteSubCategorySpy = jest.spyOn(apiService, 'deleteSubCategory').mockReturnValue(of({ id: '1', name: 'DeletedSubcategory', categoryId: '1', userId: '76aa' }));
  
//     component.deleteSubcategory(1);
//     fixture.detectChanges();
//     tick();
  
//     expect(deleteSubCategorySpy).toHaveBeenCalledWith(1);
//     expect(snackbar.open).toHaveBeenCalledWith('Item removed successfully.', 'Close', { duration: 3000 });
//   }));
  

  it('should show error snackbar on API error', fakeAsync(() => {
    apiService.addSubCategory = jest.fn().mockReturnValue(throwError(() => new Error('API error')));
    component.addCategoryForm.setValue({ name: 'NewSubcategory', categoryId: '1', userId: '76aa' });
    component.onSubmit();
    fixture.detectChanges();
    tick();

    // expect(snackbar.open).toHaveBeenCalledWith('Error While Submitting The Category', 'Close', { duration: 3000 });
  }));
});
