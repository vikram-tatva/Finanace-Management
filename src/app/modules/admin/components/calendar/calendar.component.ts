import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ApiServiceService } from '../../../../common/services/apiService.service';
import {
  Expense,
  Incomes,
  PaymentType,
  Subcategory,
} from '../../../../common/models/expenses.model';
import { DetailDailogComponent } from './detail-dailog/detail-dailog.component';
import { MaterialModule } from '../../../../common/matrial/matrial.module';
import { FullCalendarModule } from '@fullcalendar/angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonServiceService } from '../../../../common/services/common-service.service';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { DailogService } from '../../../../common/services/dailog.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [MaterialModule, FullCalendarModule,NgxSkeletonLoaderModule,CommonModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
  subCategory:Subcategory[];
  
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: (arg) => this.handleDateClick(arg),
    eventClick: (arg) => this.handleEventClick(arg),
    events: [],
  };
  dataIsLoad:boolean=false;
userId:string;
isLoading:boolean;
showLinebar = false;
  private eventMap: {
    [date: string]: { incomes: Incomes[]; expenses: Expense[] };} = {};
  private originalEvents: EventInput[] = [];

  accountType: PaymentType[];
  constructor(
    private apiService: ApiServiceService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: any,
    private dailogService:DailogService,
    private commonService: CommonServiceService
  ) {}

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
if (userString) {
  const user = JSON.parse(userString);
  this.userId = user.id;
}
    if (isPlatformBrowser(this.platformId)) {
      this.loadEvents();
    }
    this.apiService.getAccount(this.userId).subscribe({
      next: (response: PaymentType[]) => {
        this.accountType = response;
      },
      error: (err) => {
        this.snackbar.open(
          "Can't Get The Account Type Please Refrest The Page Or Try Again"
        );
      },

    });
    this.getSubCategory()
    setTimeout(() => {
      this.dataIsLoad = true
    }, 3000);
  }

  getSubCategory(){
    this.apiService.getSubCategories(this.userId).subscribe({
      next:(response:Subcategory[])=>{
        this.subCategory=response;
      },
      error:err=>{
        this.snackbar.open("SomeThing Went To Wrong!")
      }
    })
  }

  loadEvents(): void {
    // Clear the event map to avoid duplication
    this.eventMap = {};
    this.apiService.getIncomeDetails(this.userId).subscribe((incomeData) => {
      this.apiService.getExpenses(this.userId).subscribe((expenseData) => {
        const eventMap: {
          [date: string]: { income: number; expense: number };
        } = {};

        const formatDate = (date: string | Date): string => {
          if (typeof date === 'string') {
            return new Date(date).toISOString().split('T')[0];
          } else {
            return date.toISOString().split('T')[0];
          }
        };
        incomeData.forEach((income: Incomes) => {
          const formattedDate = formatDate(income.date);
          if (!this.eventMap[formattedDate]) {
            this.eventMap[formattedDate] = { incomes: [], expenses: [] };
          }
          this.eventMap[formattedDate].incomes.push(income);
          if (!eventMap[formattedDate]) {
            eventMap[formattedDate] = { income: 0, expense: 0 };
          }
          eventMap[formattedDate].income += income.amount;
        });

        expenseData.forEach((expense: Expense) => {
          const formattedDate = formatDate(expense.date);
          if (!this.eventMap[formattedDate]) {
            this.eventMap[formattedDate] = { incomes: [], expenses: [] };
          }
          this.eventMap[formattedDate].expenses.push(expense);
          if (!eventMap[formattedDate]) {
            eventMap[formattedDate] = { income: 0, expense: 0 };
          }
          eventMap[formattedDate].expense += expense.amount;
        });

        const events: EventInput[] = [];
        for (const date in eventMap) {
          const totalIncome = eventMap[date].income;
          const totalExpense = eventMap[date].expense;
          if (totalIncome > 0 && totalExpense > 0) {
            const netAmount = totalIncome - totalExpense;
            events.push({
              title: `${netAmount >= 0 ? 'Income: $' : 'Expense: $'}${Math.abs(
                netAmount
              ).toFixed(2)}`,
              date: date,
              classNames: ['income-expense-event'],
            });
          } else if (totalIncome > 0) {
            events.push({
              title: `Income: $${totalIncome.toFixed(2)}`,
              date: date,
              color: 'green',
            });
          } else if (totalExpense > 0) {
            events.push({
              title: `Expense: $${totalExpense.toFixed(2)}`,
              date: date,
              color: 'red',
            });
          }
        }
        this.isLoading=false;


        this.originalEvents = events;
        this.calendarOptions.events = events;
      });
    });
  }

  handleDateClick(arg) {
    if (isPlatformBrowser(this.platformId)) {
      const date = arg.dateStr;
      const accountOptions = this.accountType.map(account => ({
        value: account.name,
        label: account.name
      }));
      const incomeCategories = this.subCategory.filter(item=>item.categoryId=="1").map(item=>({
        value:item.name,
        label:item.name
      }))
      const expensesCategories = this.subCategory.filter(item=>item.categoryId=="2").map(item=>({
        value:item.name,
        label:item.name
      }))
      const getCategoryOptions = (type) => {
        return type === 'Income' ? incomeCategories : expensesCategories;
      };
  
      const fields=[
        {
          name: 'type', 
          label: 'Type', 
          type: 'select', 
          options: [
            { value: 'Income', label: "Income" },
            { value: "Expense", label: "Expense" }
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
        { name: 'date', label: 'Date', type: 'date', required: true,value:date },
        { name: 'account', label: 'Account', type: 'select', options: accountOptions, required: true},
        { name: 'category', label: 'Category', type: 'select', options: getCategoryOptions(''), required: true },
        { name: 'amount', label: 'Amount', type: 'input', inputType: 'number', required: true }
      ];
      const title = "Add Income/Expense";
      const dialogRef = this.dailogService.openFormDialog(title, fields);
  
        
      dialogRef.afterClosed()
        .subscribe((result) => {
          result.amount=parseFloat(result.amount)
          console.log(typeof(result.amount))
          result.account=this.accountType.find(item=>item.name==result.account).id,
          result.category=this.subCategory.find(item=>item.name==result.category).id,
          this.dataIsLoad=false;
          if (result) {
            result.userId=this.userId;
            this.isLoading=true;
            console.log(result);
            if (result.type === 'Income') {
              this.commonService
                .updateAccountBalance(
                  result.account,
                  'Income',
                  0,
                  result.amount,
                  this.accountType
                )
                .subscribe({
                  next: (response: PaymentType | null) => {
                    if (response) {
                      this.apiService.postIncomeDetails(result).subscribe({
                        next: (response: Incomes) => {
                          this.snackbar.open(
                            'Your Income Saved Successfully!',
                            'Close',
                            { duration: 3000 }
                          );
                          this.loadEvents();
                        },
                        error: (err) => {
                          this.snackbar.open('Something Went Wrong', 'Close', {
                            duration: 3000,
                          });
                          this.isLoading=false;

                        },
                      });
                    } else {
                      console.log('Balnce Is Insufficient');
                      this.isLoading=false;
                    }
                  },
                  error: (err) => {
                    console.log('Something Went To Wrong');
                    this.isLoading=false;
                  },
                });
            } else {
              this.commonService
                .updateAccountBalance(
                  result.account,
                  'Expenses',
                  0,
                  result.amount,
                  this.accountType
                )
                .subscribe({
                  next: (response: PaymentType | null) => {
                    if (response) {
                      this.apiService.postExpenses(result).subscribe({
                        next: (response: Incomes) => {
                          this.snackbar.open(
                            'Your Expenses Saved Successfully!',
                            'Close',
                            { duration: 3000 }
                          );
                          this.loadEvents();
                        },
                        error: (err) => {
                          this.snackbar.open('Something Went Wrong', 'Close', {
                            duration: 3000,
                          });
                          this.isLoading=false;
                        },
                      });
                    } else {
                      this.isLoading=false;
                      console.log('Balnce Is Insufficient');
                    }
                  },
                  error: (err) => {
                    this.isLoading=false;
                    console.log('Something Went To Wrong');
                  },
                });
            }
            const { date, account, category, amount } = result;
            console.log(
              `Added new entry on ${date}: Account: ${account}, Category: ${category}, Amount: ${amount}`
            );
          }
        });
    }
  }

  handleEventClick(arg: EventClickArg) {
    if (isPlatformBrowser(this.platformId)) {
      const date = arg.event.startStr;
      const details = this.eventMap[date] || { incomes: [], expenses: [] };
      this.dialog.open(DetailDailogComponent, {
        data: { date, ...details },
      });
    }
  }

  applyFilter(filterType: string): void {
    let filteredEvents: EventInput[] = [];

    switch (filterType) {
      case 'income':
        filteredEvents = this.originalEvents.filter(
          (event) => event.color === 'green'
        );
        break;
      case 'expense':
        filteredEvents = this.originalEvents.filter(
          (event) => event.color === 'red'
        );
        break;
      case 'both':
        filteredEvents = this.originalEvents;
        break;
      default:
        filteredEvents = [];
        break;
    }

    this.calendarOptions.events = filteredEvents;
  }
}
