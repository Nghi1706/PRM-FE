import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-table-orders',
  templateUrl: './table-orders.component.html',
  styleUrls: ['./table-orders.component.scss'],
})
export class TableOrdersComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    console.log('Table Orders Management component initialized');
  }
}
