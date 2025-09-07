import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { InventoryComponent } from './inventory.component';

const routes: Routes = [
  {
    path: '',
    component: InventoryComponent,
  },
];

@NgModule({
  declarations: [InventoryComponent],
  imports: [CommonModule, MaterialModule, RouterModule.forChild(routes)],
})
export class InventoryModule {}
