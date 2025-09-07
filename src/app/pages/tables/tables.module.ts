import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { TablesComponent } from './tables.component';

const routes: Routes = [
  {
    path: '',
    component: TablesComponent,
  },
];

@NgModule({
  declarations: [TablesComponent],
  imports: [CommonModule, MaterialModule, RouterModule.forChild(routes)],
})
export class TablesModule {}
