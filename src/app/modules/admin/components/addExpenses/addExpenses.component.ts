import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import {
  Category,
  Expense,
  PaymentType,
  Subcategory,
} from '../../../../common/models/expenses.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { CommonServiceService } from '../../../../common/services/common-service.service';
import { Subscription } from 'rxjs';
import { IncomesComponent } from '../incomes/incomes.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { DailogService } from '../../../../common/services/dailog.service';

@Component({
  selector: 'app-addExpenses',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MaterialModule,
    AsyncPipe,
    CommonModule,
    FormsModule,
    IncomesComponent,
    NgxSkeletonLoaderModule,
  ],
  templateUrl: './addExpenses.component.html',
  styleUrls: ['./addExpenses.component.css'],
})
export class AddExpensesComponent implements OnInit {
  @ViewChild('input') input: ElementRef<HTMLInputElement>;
  @ViewChild('inputCategory') inputCategory: ElementRef<HTMLInputElement>;
  dataIsLoad: boolean = false;
  expenseForm: FormGroup;
  myControl = new FormControl('');
  options: string[];
  expensesArray: FormGroup;
  accounts: PaymentType[];
  filteredOptions: string[];
  filterCategoryOption: string[];
  categories: Subcategory[];
  userId: string;
  showLinebar = false;
  isLoading: boolean;
  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private apiService: ApiServiceService,
    private snackBar: MatSnackBar,
    private router: Router,
    private commonService: CommonServiceService,
    private dailogService: DailogService
  ) {}
  //Filter For AutoComplete
  filter(): void {
    const filterValue = this.input.nativeElement.value.toLowerCase();
    this.filteredOptions = this.options.filter((o) =>
      o.toLowerCase().includes(filterValue)
    );
  }
  // filterCategory(inputElement: HTMLInputElement): void {
  //   const filterCategoryValue = inputElement.value.toLowerCase();
  //   console.log(filterCategoryValue);
  //   this.filterCategoryOption = this.categories.filter(o => o.toLowerCase().includes(filterCategoryValue));
  // }

  //formArray For Category and amount to add multiple expenses
  expenses(): FormArray {
    return this.expenseForm.get('expenses') as FormArray;
  }
  //new expense add in form group
  newExpense(): FormGroup {
    return this.fb.group({
      category: [null, Validators.required],
      amount: [null, Validators.required],
    });
  }
  addExpense() {
    const expensesFormArray = this.expenses();
    expensesFormArray.push(this.newExpense());
  }
  removeExpense(i: number) {
    this.expenses().removeAt(i);
  }

  ngOnInit() {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.userId = user.id;
    }
    this.expenseForm = this.fb.group({
      date: [null, Validators.required],
      account: [null, Validators.required],
      expenses: this.fb.array([]),
      totalAmount: [{ value: 0, disabled: true }],
      userId: [null],
    });
    this.myControl = this.expenseForm.get('account') as FormControl;
    this.addExpense();

    this.apiService.getSubCategories(this.userId).subscribe({
      next: (response: Subcategory[]) => {
        this.categories = response.filter((item) => item.categoryId == '2');
        console.log(this.categories);
      },
    });

    this.apiService.getAccount(this.userId).subscribe({
      next: (data: PaymentType[]) => {
        console.log(data);
        this.accounts = data;
        this.options = data.map((paymentType) => paymentType.name);
      },
      error: (err) => {
        console.log(err);
      },
    });
    //update total amount
    this.expenseForm.get('expenses').valueChanges.subscribe(() => {
      this.updateTotalAmount();
    });
    setTimeout(() => {
      this.dataIsLoad = true;
    }, 3000);
  }

  //when form array convert in the list of expenses interface
  transformExpenseData(formData: any): Expense[] {
    const formattedDate = this.commonService.formatedDate(formData.date);

    return formData.expenses.map((expense: any, index: number) => ({
      type: 'expense',
      date: formattedDate,
      account: formData.account,
      category: expense.category,
      amount: expense.amount,
      userId: this.userId,
    }));
  }

  validateBalance(): boolean {
    const accountName = this.expenseForm.get('account').value;
    const account = this.accounts.find((acc) => acc.id == accountName);
    if (!account) {
      this.snackBar.open('Invalid account selected', 'Close', {
        duration: 3000,
      });
      return false;
    }
    const totalAmount = this.expenseForm.get('totalAmount').value;
    if (totalAmount > account.balnce) {
      this.snackBar.open('Insufficient balance', 'Close', { duration: 3000 });
      return false;
    }
    return true;
  }
  onSubmit(): void {
    this.isLoading = true;
    if (this.expenseForm.valid) {
      if (this.validateBalance()) {
        this.expenseForm.get('userId').setValue(this.userId);
        const transformedData: Expense[] = this.transformExpenseData(
          this.expenseForm.value
        );
        const accountName = this.expenseForm.get('account').value;
        const totalAmount = this.expenseForm.get('totalAmount').value;

        this.commonService.handleExpenses(
          accountName,
          totalAmount,
          this.accounts,
          transformedData
        );

        this.expenseForm.get('expenses').valueChanges.subscribe(() => {
          this.updateTotalAmount();
        });
        this.snackBar.open('Expense successfully added', 'Close', {
          duration: 3000,
        });
        setTimeout(() => {
          this.isLoading = false;
        }, 3000);
      } else {
        this.isLoading = false;

        this.snackBar.open('Please Enter The Some Income!!', 'Close', {
          duration: 3000,
        });
      }
    } else {
      const expensesFormArrayCheck = this.expenseForm.get(
        'expenses'
      ) as FormArray;

      if (expensesFormArrayCheck.length == 0) {
        this.addExpense();
        expensesFormArrayCheck.markAsUntouched();
      }
      this.expenseForm.markAllAsTouched();
      this.snackBar.open('Please fill out the form correctly', 'Close', {
        duration: 3000,
      });
    }
  }
  editElement() {
    const accountOptions = this.accounts.map(account => ({
      value: account.name,
      label: account.name
    }));
  
    const incomeCategories = [
      { value: 'salary', label: 'Salary' },
      { value: 'business', label: 'Business' }
    ];
  
    const expenseCategories = [
      { value: 'clothing', label: 'Clothing' },
      { value: 'food', label: 'Food' },
      { value: 'entertainment', label: 'Entertainment' }
    ];
  
    const getCategoryOptions = (type) => {
      return type === 'income' ? incomeCategories : expenseCategories;
    };
  
    const fields = [
      {
        name: 'type', 
        label: 'Type', 
        type: 'select', 
        options: [
          { value: 'income', label: "Income" },
          { value: 'expense', label: "Expense" }
        ],
        required: true,
        onChange: (newValue, form) => {
          const categoryField = form.fields.find(field => field.name === 'category');
          if (categoryField) {
            categoryField.options = getCategoryOptions(newValue);
            form.form.get('category')?.setValue('');
          }
        }
      },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'account', label: 'Account', type: 'select', options: accountOptions, required: true },
      { name: 'category', label: 'Category', type: 'select', options: getCategoryOptions('expense'), required: true },
      { name: 'amount', label: 'Amount', type: 'input', inputType: 'number', required: true }
    ];
  
    const dialogRef = this.dailogService.openFormDialog('Edit Expense', fields);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleFormResult(result);
      }
    });
  }

  handleFormResult(result: any): void {
    console.log('Form result:', result);
  }
  
  
  onCancel() {
    this.expenseForm.reset();
  }
  //update the total
  updateTotalAmount() {
    const expensesArray = this.expenseForm.get('expenses') as FormArray;
    console.log(expensesArray.controls);
    const total = expensesArray.controls.reduce(
      (acc, control) => acc + control.get('amount').value,
      0
    );
    this.expenseForm.get('totalAmount').setValue(total);
  }
  isControlInvalid(controlName: string): boolean {
    const control = this.expenseForm.get(controlName);
    return control ? control.invalid && control.dirty : false;
  }
}
