import { Component } from '@angular/core';

@Component({
  selector: 'app-inventory',
  template: `
    <div class="inventory-container">
      <h1>Inventory Management</h1>
      <p>Manage restaurant inventory and stock levels</p>
    </div>
  `,
  styles: [
    `
      .inventory-container {
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
export class InventoryComponent {
  constructor() {}
}
