import { Component } from '@angular/core';

@Component({
  selector: 'app-users',
  template: `
    <div class="users-container">
      <h1>Users Management</h1>
      <p>Manage system users (Admin only)</p>
    </div>
  `,
  styles: [
    `
      .users-container {
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
export class UsersComponent {
  constructor() {}
}
