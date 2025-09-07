import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { RestaurantsComponent } from './restaurants.component';

const routes: Routes = [
  {
    path: '',
    component: RestaurantsComponent,
  },
];

@NgModule({
  declarations: [RestaurantsComponent],
  imports: [CommonModule, MaterialModule, RouterModule.forChild(routes)],
})
export class RestaurantsModule {}
