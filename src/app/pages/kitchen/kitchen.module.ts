import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { KitchenComponent } from './kitchen.component';

const routes: Routes = [
  {
    path: '',
    component: KitchenComponent,
  },
];

@NgModule({
  declarations: [KitchenComponent],
  imports: [CommonModule, MaterialModule, RouterModule.forChild(routes)],
})
export class KitchenModule {}
