import { Component } from '@angular/core';

@Component({
  selector: 'app-cart',
  template: `
    <div class="cart-container">
      <h1>Shopping Cart</h1>
      <p>Your order cart and checkout (Guest only)</p>
    </div>
  `,
  styles: [
    `
      .cart-container {
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
export class CartComponent {
  constructor() {}
}
