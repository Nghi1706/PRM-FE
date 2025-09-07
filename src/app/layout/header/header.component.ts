import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Observable } from 'rxjs';
import { ThemeService, ThemeType } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';
import { UserRole, ROLE_INFO } from '../../constants/roles';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    AsyncPipe,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Output() toggleNavbar = new EventEmitter<void>();
  theme$: Observable<ThemeType>;

  userInfo: { userId: string | null; restaurantId: string | null; role: UserRole | null } = {
    userId: null,
    restaurantId: null,
    role: null,
  };

  roleInfo: string = '';

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private permissionService: PermissionService
  ) {
    this.theme$ = this.themeService.theme$;
  }

  ngOnInit() {
    this.loadUserInfo();
  }

  private loadUserInfo() {
    this.userInfo = this.permissionService.getCurrentUserInfo();
    if (this.userInfo.role) {
      this.roleInfo = ROLE_INFO[this.userInfo.role].name;
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
  }
}
