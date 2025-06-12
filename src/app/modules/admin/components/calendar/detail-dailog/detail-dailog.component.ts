import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Expense, Incomes } from '../../../../../common/models/expenses.model';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../../common/matrial/matrial.module';

@Component({
  selector: 'app-detail-dailog',
  standalone: true,
  imports: [CommonModule,MaterialModule],
  templateUrl: './detail-dailog.component.html',
  styleUrl: './detail-dailog.component.css'
})
export class DetailDailogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { date: string, incomes: Incomes[], expenses: Expense[] }) { }

}
