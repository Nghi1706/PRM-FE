import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      <p>Welcome to the Restaurant Management System Dashboard</p>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    h1 {
      margin-bottom: 16px;
    }
  `]
})
export class DashboardComponent {
  constructor() {}
}
