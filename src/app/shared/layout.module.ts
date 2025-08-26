import { LayoutModule as CdkLayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material.module';

import { HeaderComponent } from '../components/header/header.component';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { MainLayoutComponent } from '../layouts/main-layout/main-layout.component';

@NgModule({
  declarations: [MainLayoutComponent, HeaderComponent, NavbarComponent],
  imports: [CommonModule, RouterModule, CdkLayoutModule, MaterialModule],
  exports: [MainLayoutComponent, HeaderComponent, NavbarComponent],
})
export class LayoutModule {}
