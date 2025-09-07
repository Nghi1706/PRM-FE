import { Component } from '@angular/core';

@Component({
  selector: 'app-reports',
  template: `
    <div class="reports-container">
      <h1>Reports</h1>
      <p>View restaurant analytics and reports</p>
    </div>
  `,
  styles: [
    `
      .reports-container {
        max-width: 1200px;
        padding: 20px;
      }

      h1 {
        margin-bottom: 16px;
        color: var(--text-primary);
      }
    `,
  ],
})
export class ReportsComponent {
  constructor() {}
}
