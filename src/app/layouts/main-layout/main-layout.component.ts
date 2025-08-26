import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  private destroy$ = new Subject<void>();
  isDesktop = true;
  sidenavOpened = true;
  isNavOpen = true; // Trạng thái navbar để truyền cho header

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isDesktop = !result.matches;

        if (this.isDesktop) {
          // Desktop: sidebar có thể toggle
          this.sidenavOpened = this.isNavOpen;
        } else {
          // Mobile: sidebar luôn đóng, header full width
          this.sidenavOpened = false;
          this.isNavOpen = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  toggleSidenav(): void {
    if (this.isDesktop) {
      // Desktop: toggle side nav
      this.sidenav.toggle();
      this.isNavOpen = !this.isNavOpen;
    } else {
      // Mobile: toggle over nav
      this.sidenav.toggle();
    }
  }

  onSidenavOpenedChange(isOpened: boolean): void {
    if (this.isDesktop) {
      this.isNavOpen = isOpened;
    }
  }
}
