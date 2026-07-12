import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TrustedContact } from '../../../models/trusted-contact';
import { TrustedContactService } from '../../../services/trusted-contact';

@Component({
  selector: 'app-contact-list',
  imports: [RouterLink],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.css',
})
export class ContactList implements OnInit {
  private readonly contactService = inject(TrustedContactService);

  protected readonly contacts = signal<TrustedContact[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');

  async ngOnInit(): Promise<void> {
    await this.loadContacts();
  }

  protected async loadContacts(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const contacts = await this.contactService.listActive();
      this.contacts.set(contacts);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load your contacts.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
