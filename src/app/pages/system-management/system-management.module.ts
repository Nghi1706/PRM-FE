import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { SystemManagementComponent } from './system-management.component';

const routes: Routes = [
  {
    path: '',
    component: SystemManagementComponent,
  },
];

@NgModule({
  declarations: [SystemManagementComponent],
  imports: [CommonModule, MaterialModule, RouterModule.forChild(routes)],
})
export class SystemManagementModule {}
