import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { DishCreateDialogComponent } from './dish-create-dialog/dish-create-dialog.component';
import { DishesComponent } from './dishes.component';

const routes: Routes = [
  {
    path: '',
    component: DishesComponent,
  },
];

@NgModule({
  declarations: [DishesComponent, DishCreateDialogComponent],
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, RouterModule.forChild(routes)],
})
export class DishesModule {}
