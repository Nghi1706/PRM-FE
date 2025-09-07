import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'PRM01';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Clear any corrupted storage on app init
    try {
      this.authService.clearStorageIfCorrupted();
    } catch (error) {
      console.error('Error during app initialization:', error);
      // Force clean storage if there's any error
      localStorage.clear();
      window.location.reload();
    }
  }
}
