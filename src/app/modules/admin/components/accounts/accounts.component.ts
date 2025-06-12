import { Component, OnInit } from '@angular/core';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import { PaymentType } from '../../../../common/models/expenses.model';
import {
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AsyncPipe, CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { DailogService } from '../../../../common/services/dailog.service';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [MaterialModule, CommonModule, AsyncPipe,NgxSkeletonLoaderModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css',
})
export class AccountsComponent implements OnInit {
  snackbar(snackbar: any, arg1: string) {
      throw new Error('Method not implemented.');
  }
  accounts: PaymentType[] = [];
  accountForm: FormGroup;
  editForm: FormGroup;
  dataIsLoad:boolean=false;
  editIndex: number | null = null;
  userId:string;
  showLinebar = false;
  isLoading:boolean;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiServiceService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private dailogService:DailogService
  ) {
    this.accountForm = this.fb.group({
      accountName: ['', Validators.required],
      accountBalance: ['', Validators.required],
    });
    this.editForm = this.fb.group({
      accountName: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.userId = user.id;
    }
    this.loadAccounts();
    setTimeout(() => {
      this.dataIsLoad = true
    }, 3000);
  }

  loadAccounts(): void {
    this.apiService.getAccount(this.userId).subscribe((accounts) => {
      this.accounts = accounts;
    });
  }

  openDialog(): void {
    const fields=[
      {
        name:'accountName',
        label:'Account Name',
        type:'input',
        inputType:'text',
        require:true
      },
      {
        name:'accountBalance',
        label:"Account Balance",
        type:'input',
        inputType:'number',
        require:true
      }
    ]
    const title ='Add Account';
    const dialogRef = this.dailogService.openFormDialog(title, fields);

   
      dialogRef.afterClosed()
      .subscribe((result) => {
        console.log(result)

        if (result) {
          this.isLoading=true;
          this.onSubmit(result);
        }
      });
  }

  openEditDialog(index: number): void {
    this.editIndex=index;
    const fields=[
      {
        name:'accountName',
        label:'Account Name',
        type:'input',
        value:this.accounts[index].name,
        inputType:'text',
        require:true
      }
    
    ]
    const title ='Edit Account';
    const dialogRef = this.dailogService.openFormDialog(title, fields);

      dialogRef.afterClosed()
      .subscribe((result) => {
        if (result) {
          console.log(result)
          this.isLoading=true;
          this.onEditSubmit(result);
        }
      });
  }

  isControlInvalid(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return control ? control.invalid && control.touched : false;
  }

  onSubmit(result): void {
      const newAccount: PaymentType = {
        name: result.accountName,
        balnce: parseFloat(result.accountBalance),
        userId:this.userId
      };

      if (this.accounts.some((account) => account.name === newAccount.name)) {
        this.isLoading=false;
        this.snackBar.open('Account name already exists', 'Close', {
          duration: 3000,
        });
        return;
      }

      this.apiService.postAccount(newAccount).subscribe({
        next: (response: PaymentType) => {
          console.log('Account added successfully', response);
          this.accounts.push(response);
          this.isLoading=false;
          this.snackBar.open('Account added successfully', 'Close', {
            duration: 3000,
          });
          this.accountForm.reset();
        },
        error: (err) => {
          this.isLoading=false;
          console.error('Error adding account', err);
          this.snackBar.open('Error adding account', 'Close', {
            duration: 3000,
          });
        },
      });
    }

  onEditSubmit(result): void {
    console.log(result)
    console.log(this.accounts)
      const updatedName = result.accountName;

      if (
        this.accounts.some(
          (account, i) => account.name === updatedName && i !== this.editIndex
        )
      ) {
        this.snackBar.open('Account name already exists', 'Close', {
          duration: 3000,
        });
        this.isLoading=false;

        return;
      }

      this.accounts[this.editIndex].name = updatedName;
      this.apiService.updateAccount(this.accounts[this.editIndex]).subscribe({
        next: (response: PaymentType) => {
          console.log('Account updated successfully', response);
          this.snackBar.open('Account updated successfully', 'Close', {
            duration: 3000,
          });
          this.editForm.reset();
          this.isLoading=false;
          this.editIndex = null;
        },
        error: (err) => {
          this.isLoading=false;
          console.error('Error updating account', err);
          this.snackBar.open('Error updating account', 'Close', {
            duration: 3000,
          });
        },
      });
    }
}
