import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../../interface/auth';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() isNavOpen = false; // Nhận trạng thái navbar từ layout
  @Output() toggleNav = new EventEmitter<void>();

  user: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        try {
          this.user = this.authService.getUser();
        } catch (error) {
          console.error('Error getting user in HeaderComponent:', error);
          this.user = null;
        }
      } else {
        this.user = null;
      }
    });
  }

  onToggleNav(): void {
    this.toggleNav.emit();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
