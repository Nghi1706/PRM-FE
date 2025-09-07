import { Component } from '@angular/core';

@Component({
  selector: 'app-restaurants',
  template: `
    <div class="restaurants-container">
      <h1>Restaurants Management</h1>
      <p>Manage all restaurants in the system (Admin only)</p>
    </div>
  `,
  styles: [
    `
      .restaurants-container {
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
export class RestaurantsComponent {
  constructor() {}
}
