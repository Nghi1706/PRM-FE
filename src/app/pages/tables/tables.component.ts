import { Component } from '@angular/core';

@Component({
  selector: 'app-tables',
  template: `
    <div class="tables-container">
      <h1>Table Management</h1>
      <p>Manage restaurant tables and seating arrangements</p>
    </div>
  `,
  styles: [
    `
      .tables-container {
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
export class TablesComponent {
  constructor() {}
}
