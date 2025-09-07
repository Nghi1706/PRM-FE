import { Component } from '@angular/core';

@Component({
  selector: 'app-system-management',
  template: `
    <div class="system-management-container">
      <h1>System Management</h1>
      <p>System-wide management and configuration (Developer only)</p>
    </div>
  `,
  styles: [
    `
      .system-management-container {
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
export class SystemManagementComponent {
  constructor() {}
}
