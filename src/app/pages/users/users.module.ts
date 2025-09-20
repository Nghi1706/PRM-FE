import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { UserCreateDialogComponent } from './user-create-dialog/user-create-dialog.component';
import { UsersComponent } from './users.component';

const routes: Routes = [
  {
    path: '',
    component: UsersComponent,
  },
];

@NgModule({
  declarations: [UsersComponent, UserCreateDialogComponent],
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, RouterModule.forChild(routes)],
})
export class UsersModule {}
