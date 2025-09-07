import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { MenuComponent } from './menu.component';

const routes: Routes = [
  {
    path: '',
    component: MenuComponent,
  },
];

@NgModule({
  declarations: [MenuComponent],
  imports: [CommonModule, MaterialModule, RouterModule.forChild(routes)],
})
export class MenuModule {}
