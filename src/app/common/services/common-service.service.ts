import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiServiceService } from './apiService.service';
import { Expense, PaymentType } from '../models/expenses.model';
import { Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { response } from 'express';

@Injectable({
  providedIn: 'root'
})
export class CommonServiceService {

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router,
    private apiService: ApiServiceService,
  ) {}

  
  validateBalance(account: PaymentType, amount: number, type: string, previousAmount: number): boolean {
    if (type === 'Expenses' && (account.balnce + previousAmount) < amount) {
      this.snackBar.open("Insufficient balance", "Close", { duration: 3000 });
      return false;
    }
    return true;
  }
  updateAccountBalance(accountName: string, type: string, previousAmount: number, amount: number, accounts: PaymentType[]): Observable<PaymentType> {
    const account = accounts.find(acc => acc.id === accountName);
  
    if (!account) {
      throw new Error('Account not found');
    }
  
    if (!this.validateBalance(account, amount, type, previousAmount)) {
      return throwError(new Error('Insufficient Balance'));
    }
  
    if (type === 'Expenses') {
      account.balnce += previousAmount;
      account.balnce -= amount;
    } else {
      account.balnce -= previousAmount;
      account.balnce += amount;
    }
  
    return this.apiService.updateAccount(account);
  }


  postExpenses(expenses: Expense[]): void {
    expenses.forEach((expense) => {
      this.apiService.postExpenses(expense).subscribe({
        next: (response:Expense) => {
          console.log('Expense saved successfully:', response);
        },
        error: (err) => {
          this.snackBar.open("Something went wrong, please try again", "Close", { duration: 3000 });
          console.error('Error saving expense:', err);
        }
      });
    });
  }
  


  handleExpenses(accountName: string, totalAmount: number, accounts: PaymentType[], transformedData: Expense[]): void {
    this.updateAccountBalance(accountName,"Expenses",0, totalAmount, accounts).subscribe({
      next: (response: PaymentType) => {
        this.snackBar.open("Balance updated successfully", "Close", { duration: 3000 });
        this.postExpenses(transformedData);
        setTimeout(() => {
          this.router.navigate(['/admin/transactionData'])
          
        }, 3000);

      },
      error: (err) => {
        this.snackBar.open("Error updating balance", "Close", { duration: 3000 });
        console.error('Error updating account:', err);
      }
    });
  }

  formatedDate(formDate:Date):string{
    const date = new Date(formDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate
  }
}
