import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../matrial/matrial.module';

@Component({
  selector: 'app-dailog',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule, CommonModule, MatDatepickerModule, MatNativeDateModule, FormsModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './dailog.component.html',
  styleUrls: ['./dailog.component.css']
})
export class DailogComponent {
  form!: FormGroup;
  fields: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DailogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this.fb.group({});
    this.fields = this.data.componentData.fields || [];
    this.fields.forEach(field => {
      const control = this.fb.control(
        field.value || '',
        field.required ? Validators.required : null
      );
      this.form.addControl(field.name, control);
    });
  }

  handleFieldChange(newValue: any, field: any): void {
    if (field.onChange) {
      field.onChange(newValue, { fields: this.fields, form: this.form });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
