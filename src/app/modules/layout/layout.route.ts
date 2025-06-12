import { Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';

export const layoutRoutes: Routes = [
    {
        path:'',
        component:LayoutComponent,
        children:[
            {
                path:'',
                loadComponent:()=>import('../admin/components/dashboard/dashboard.component').then((m)=>m.DashboardComponent)

            },
            {
                path:'home',
                loadComponent:()=>import('../admin/components/dashboard/dashboard.component').then((m)=>m.DashboardComponent)
            },
            {
                path:'addExpenses',
                loadComponent:()=>import('../admin/components/addExpenses/addExpenses.component').then((m)=>m.AddExpensesComponent  )
            },
            
            {
                path:'accounts',
                loadComponent:()=>import('../admin/components/accounts/accounts.component').then((m)=>m.AccountsComponent)
            },
            {
                path:'incomes',
                loadComponent:()=>import('../admin/components/incomes/incomes.component').then((m)=>m.IncomesComponent)
            },
            {
                path:'calenders',
                loadComponent:()=>import('../admin/components/calendar/calendar.component').then((m)=>m.CalendarComponent)
            },
            {
                path:'category',
                loadComponent:()=>import('../admin/components/category/category.component').then((m)=>m.CategoryComponent)
            },
            {
                path:'transactionData',
                loadComponent:()=>import('../admin/components/show-transaction/show-transaction.component').then((m)=>m.ShowTransactionComponent)
            }
            
        ]
    }
]