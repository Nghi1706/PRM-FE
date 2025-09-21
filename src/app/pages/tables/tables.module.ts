import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { TableCreateDialogComponent } from './table-create-dialog/table-create-dialog.component';
import { TableDeleteDialogComponent } from './table-delete-dialog/table-delete-dialog.component';
import { TableEditDialogComponent } from './table-edit-dialog/table-edit-dialog.component';
import { TablesComponent } from './tables.component';

const routes: Routes = [
  {
    path: '',
    component: TablesComponent,
  },
];

@NgModule({
  declarations: [TablesComponent, TableCreateDialogComponent, TableEditDialogComponent, TableDeleteDialogComponent],
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, RouterModule.forChild(routes)],
})
export class TablesModule {}
