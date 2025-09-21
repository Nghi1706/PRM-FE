import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { CategoriesComponent } from './categories.component';
import { CategoryCreateDialogComponent } from './category-create-dialog/category-create-dialog.component';
import { CategoryEditDialogComponent } from './category-edit-dialog/category-edit-dialog.component';
import { CategoryDeleteDialogComponent } from './category-delete-dialog/category-delete-dialog.component';

const routes: Routes = [
  {
    path: '',
    component: CategoriesComponent,
  },
];

@NgModule({
  declarations: [CategoriesComponent, CategoryCreateDialogComponent, CategoryEditDialogComponent, CategoryDeleteDialogComponent],
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, RouterModule.forChild(routes)],
})
export class CategoriesModule {}
