import { Component } from '@angular/core';

@Component({
  selector: 'app-kitchen',
  template: `
    <div class="kitchen-container">
      <h1>Kitchen Dashboard</h1>
      <p>Kitchen management and order preparation (Chef only)</p>
    </div>
  `,
  styles: [
    `
      .kitchen-container {
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
export class KitchenComponent {
  constructor() {}
}
