import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DailogComponent } from '../dailog/dailog.component';

@Injectable({
  providedIn: 'root'
})
export class DailogService {

  constructor(private dialog: MatDialog) { }

  openDialog(component: any, title: string, componentData?: any) {
    return this.dialog.open(component, {
      width: '400px',
      data: { title, component, componentData }
    });
  }

  openFormDialog(title: string, fields: any[]) {
    return this.openDialog(DailogComponent, title, { fields });
  }
}
