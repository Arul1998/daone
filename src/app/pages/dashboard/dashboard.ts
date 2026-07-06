import { Component, inject } from '@angular/core';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.user;

  protected readonly summaryCards = [
    { title: 'Assets', value: '—', note: 'Coming soon' },
    { title: 'Loans', value: '—', note: 'Coming soon' },
    { title: 'Insurance', value: '—', note: 'Coming soon' },
    { title: 'Contacts', value: '—', note: 'Coming soon' },
  ];
}
