import { Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  template: `
    <div class="settings-container">
      <h1>Settings</h1>
      <p>System settings and configuration (Admin only)</p>
    </div>
  `,
  styles: [
    `
      .settings-container {
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
export class SettingsComponent {
  constructor() {}
}
