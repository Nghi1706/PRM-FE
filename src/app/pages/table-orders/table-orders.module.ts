import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { TableOrdersComponent } from './table-orders.component';

const routes: Routes = [
  {
    path: '',
    component: TableOrdersComponent,
  },
];

@NgModule({
  declarations: [TableOrdersComponent],
  imports: [CommonModule, MaterialModule, RouterModule.forChild(routes)],
})
export class TableOrdersModule {}
