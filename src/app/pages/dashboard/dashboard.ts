import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly summaryCards = [
    { title: 'Assets', value: '—', note: 'Coming soon' },
    { title: 'Loans', value: '—', note: 'Coming soon' },
    { title: 'Insurance', value: '—', note: 'Coming soon' },
    { title: 'Contacts', value: '—', note: 'Coming soon' },
  ];
}
