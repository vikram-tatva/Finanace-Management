import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import {
  Category,
  Subcategory,
} from '../../../../common/models/expenses.model';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { DailogService } from '../../../../common/services/dailog.service';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    CommonModule,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent {
  categories: Category[] = [];
  subcategories: Subcategory[];
  displayedSubcategories: any[] = [];
  searchForm: FormGroup;
  addCategoryForm: FormGroup;
  editForm: FormGroup;
  selectedSection: 'Income' | 'Expenses' | null = null;
  dataIsLoad: boolean = false;
  displayedColumns: string[] = [
    'id',
    'categoryName',
    'subcategoryName',
    'actions',
  ];
  showLinebar = false;
  userId: string;
  isLoading: boolean;
  constructor(
    private categoryService: ApiServiceService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private router: Router,
    private dailogService: DailogService
  ) {
    this.addCategoryForm = this.fb.group({
      name: ['', Validators.required],
      categoryId: ['', Validators.required],
      userId: [null],
    });
    this.editForm = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      categoryId: ['', Validators.required],
      userId: [null],
    });
  }

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.userId = user.id;
    }
    this.searchForm = this.fb.group({
      filterText: [''],
    });
    this.getSubCategory();
    this.getCategory();
    this.searchForm.get('filterText').valueChanges.subscribe((value) => {
      this.filterCategories(value);
    });
    setTimeout(() => {
      this.dataIsLoad = true;
    }, 3000);
  }

  getSubCategory(): void {
    this.categoryService.getSubCategories(this.userId).subscribe({
      next: (response: Subcategory[]) => {
        console.log(response);
        this.subcategories = response;
      },
      error: (err) => {
        this.snackbar.open('SomeThing Went Wrong', 'Close', { duration: 3000 });
        this.router.navigate(['/home']);
      },
    });
  }
  getCategory(): void {
    this.categoryService.getCategories().subscribe({
      next: (response: Category[]) => {
        this.categories = response;
        this.filterCategories('');
        console.log(this.categories);
      },
    });
  }

  filterCategories(searchText: string): void {
    const lowerSearchText = searchText.toLowerCase();
    this.displayedSubcategories = this.categories.reduce((acc, category) => {
      const matchingSubcategories = category.subcategories.filter(
        (subcategory) =>
          subcategory.name.toLowerCase().includes(lowerSearchText) &&
          subcategory.userId == this.userId
      );
      if (
        matchingSubcategories.length > 0 ||
        category.name.toLowerCase().includes(lowerSearchText)
      ) {
        matchingSubcategories.forEach((subcategory) => {
          acc.push({
            id: subcategory.id,
            categoryName: category.name,
            subcategoryName: subcategory.name,
          });
        });
      }
      console.log(acc);
      this.isLoading = false;
      return acc;
    }, []);
  }

  openDialog(): void {
    const categories = this.categories.map((item) => ({
      value: item.id,
      label: item.name,
    }));
    const fields = [
      {
        name: 'name',
        label: 'Name Of Category',
        type: 'input',
        required: true,
      },
      {
        name: 'categoryId',
        label: 'Name Of Category',
        type: 'select',
        required: true,
        options: categories,
      },
    ];

    const title = 'Add Category';
    const dialogRef = this.dailogService.openFormDialog(title, fields);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.isLoading = true;
        this.addCategoryForm.get('name').setValue(result.name);
        this.addCategoryForm.get('categoryId').setValue(result.categoryId);
        this.addCategoryForm.get('userId').setValue(this.userId);
        result.userId = this.userId;
        this.onSubmit();
      }
    });
  }

  onSubmit() {
    this.categoryService.addSubCategory(this.addCategoryForm.value).subscribe({
      next: (response: Subcategory) => {
        this.getCategory();
        this.filterCategories('');
        this.getSubCategory();
        this.addCategoryForm.reset();
      },
      error: (err) => {
        this.isLoading = false;
        this.snackbar.open('Error While Submitting The Category', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  updateCategory(subcategoryId: string): void {
    const categories = this.categories.map((item) => ({
      value: item.id,
      label: item.name,
      disabled:true
    }));

    console.log(this.subcategories);
    console.log(subcategoryId);
    const subcategoryById = this.subcategories.find(
      (item) => item.id == subcategoryId
    );
    this.editForm.setValue({
      id: subcategoryById.id,
      name: subcategoryById.name,
      categoryId: subcategoryById.categoryId,
      userId: this.userId,
    });
    const fields = [
      {
        name: 'name',
        label: 'Name Of Category',
        type: 'input',
        value: subcategoryById.name,
        required: true,
      },
      {
        name: 'categoryId',
        label: 'Select Category',
        type: 'select',
        options: categories,
        value: subcategoryById.categoryId,
        required: true,
      },
    ];
    const title = 'Edit Category';
    const dialogRef = this.dailogService.openFormDialog(title, fields);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
          result.id= subcategoryById.id,
          result.name= result.name,
          result.categoryId= result.categoryId,
          result.userId= this.userId,
        this.isLoading = true;
        this.onEditSubmit(result);
      }
    });
  }
  onEditSubmit(result) {
      this.categoryService.updateSubCategory(result).subscribe({
        next: (response: Subcategory) => {
          this.getCategory();
          this.filterCategories('');
        },
        error: (err) => {
          this.isLoading = false;
          this.snackbar.open('Error While The Updateing The Data', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  deleteSubcategory(subcategoryId: number): void {
    Swal.fire({
      position: 'top',
      title: 'Are you sure?',
      text: 'This process is irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, go ahead.',
      cancelButtonText: 'No, let me think',
    }).then((result) => {
      if (result.value) {
        Swal.fire('Removed!', 'Item removed successfully.', 'success');
        this.categoryService.deleteSubCategory(subcategoryId).subscribe({
          next: (response: Subcategory) => {
            this.getCategory();
            this.filterCategories('');
          },
          error: (err) => {
            this.snackbar.open('error while removing the category', 'Close', {
              duration: 3000,
            });
          },
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Item is safe.)', 'error');
      }
    });
  }

  selectSection(section: 'Income' | 'Expenses'): void {
    this.selectedSection = section;
  }
}
