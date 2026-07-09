import { Component, inject, OnInit, signal } from '@angular/core';

import { Profile } from '../../models/profile';
import { AuthService } from '../../services/auth';
import { ProfileService } from '../../services/profile';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly profileService = inject(ProfileService);

  protected readonly user = this.auth.user;
  protected readonly profile = signal<Profile | null>(null);
  protected readonly profileError = signal('');

  protected readonly summaryCards = [
    { title: 'Assets', value: '—', note: 'Coming soon' },
    { title: 'Loans', value: '—', note: 'Coming soon' },
    { title: 'Insurance', value: '—', note: 'Coming soon' },
    { title: 'Contacts', value: '—', note: 'Coming soon' },
  ];

  async ngOnInit(): Promise<void> {
    await this.auth.init();

    try {
      const profile = await this.profileService.getMyProfile();
      this.profile.set(profile);
    } catch {
      this.profileError.set('Could not load your profile. Please try again later.');
    }
  }
}
