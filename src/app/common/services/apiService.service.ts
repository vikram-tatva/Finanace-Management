import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { NetworkService } from './network.service'; // Make sure to import the NetworkService
import {
  Category,
  Expense,
  Incomes,
  PaymentType,
  Registration,
  Subcategory,
  User,
} from '../models/expenses.model';

@Injectable({
  providedIn: 'root',
})
export class ApiServiceService {
  constructor(private networkService: NetworkService) {}

  getExpenses(userId: string): Observable<Expense[]> {
    return this.networkService.get<Expense[]>(`/expenses`, { userId });
  }

  postExpenses(expenses: Expense): Observable<Expense> {
    return this.networkService.post<Expense>(`/expenses`, expenses);
  }

  updateExpense(expenses: Expense): Observable<Expense> {
    return this.networkService.put<Expense>(`/expenses/${expenses.id}`, expenses);
  }

  getAccount(userId: string): Observable<PaymentType[]> {
    return this.networkService.get<PaymentType[]>(`/PaymentType`, { userId });
  }

  postAccount(paymentType: PaymentType): Observable<PaymentType> {
    return this.networkService.post<PaymentType>(`/PaymentType`, paymentType);
  }

  updateAccount(account: PaymentType): Observable<PaymentType> {
    console.log(account);
    return this.networkService.put<PaymentType>(`/PaymentType/${account.id}`, account);
  }

  getIncomeDetails(userId: string): Observable<Incomes[]> {
    return this.networkService.get<Incomes[]>(`/income`, { userId });
  }

  postIncomeDetails(income: Incomes): Observable<Incomes> {
    return this.networkService.post<Incomes>(`/income`, income);
  }

  updateIncomeDetails(income: Incomes): Observable<Incomes> {
    return this.networkService.put<Incomes>(`/income/${income.id}`, income);
  }

  getCategories(): Observable<Category[]> {
    return this.networkService.get<Category[]>(`/categories`, { _embed: 'subcategories' });
  }

  getSubCategories(userId: string): Observable<Subcategory[]> {
    return this.networkService.get<Subcategory[]>(`/subcategories`, { userId });
  }

  addSubCategory(subCategory: Subcategory): Observable<Subcategory> {
    return this.networkService.post<Subcategory>(`/subcategories`, subCategory);
  }

  deleteSubCategory(subcategoryId: number): Observable<Subcategory> {
    return this.networkService.delete<Subcategory>(`/subcategories/${subcategoryId}`);
  }

  updateSubCategory(subcategory: Subcategory): Observable<Subcategory> {
    return this.networkService.put<Subcategory>(`/subcategories/${subcategory.id}`, subcategory);
  }

  getIncomeAndExpenses(userId: string): Observable<any[]> {
    return forkJoin([this.getIncomeDetails(userId), this.getExpenses(userId)]);
  }

  deleteExpenses(expenseId: string): Observable<Expense> {
    return this.networkService.delete<Expense>(`/expenses/${expenseId}`);
  }

  deleteIncome(incomeId: string): Observable<Incomes> {
    return this.networkService.delete<Incomes>(`/income/${incomeId}`);
  }

  registrationUser(registration: Registration): Observable<Registration> {
    return this.networkService.post<Registration>(`/registration`, registration);
  }

  loginUser(): Observable<Registration[]> {
    return this.networkService.get<Registration[]>(`/registration`);
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.networkService.get<any[]>(`/registration`).pipe(
      map(users => users.some(user => user.email === email))
    );
  }

  forgotPassword(registration: Registration): Observable<Registration> {
    return this.networkService.put<Registration>(`/registration/${registration.id}`, registration);
  }

  public isLoggedIn(): boolean {
    const user = this.getUser();
    if (user) {
      return user.email != null;
    }
    return false;
  }

  public getUser(): User | null {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      const user: User = JSON.parse(userJson);
      return user;
    }
    return null;
  }
}
