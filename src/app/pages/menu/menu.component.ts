import { Component } from '@angular/core';

@Component({
  selector: 'app-menu',
  template: `
    <div class="menu-container">
      <h1>Menu Management</h1>
      <p>Manage restaurant menu items</p>
    </div>
  `,
  styles: [
    `
      .menu-container {
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
export class MenuComponent {
  constructor() {}
}
