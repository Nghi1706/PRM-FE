import { Component } from '@angular/core';

@Component({
  selector: 'app-orders',
  template: `
    <div class="orders-container">
      <h1>Orders Management</h1>
      <p>Manage restaurant orders</p>
    </div>
  `,
  styles: [
    `
      .orders-container {
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
export class OrdersComponent {
  constructor() {}
}
