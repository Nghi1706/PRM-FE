import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DishCreateDialogComponent } from './dish-create-dialog/dish-create-dialog.component';
import { DishDeleteDialogComponent } from './dish-delete-dialog/dish-delete-dialog.component';
import { DishEditDialogComponent } from './dish-edit-dialog/dish-edit-dialog.component';
import { DishesComponent } from './dishes.component';

const routes: Routes = [
  {
    path: '',
    component: DishesComponent,
  },
];

@NgModule({
  declarations: [DishesComponent, DishCreateDialogComponent, DishEditDialogComponent, DishDeleteDialogComponent],
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, RouterModule.forChild(routes)],
})
export class DishesModule {}
