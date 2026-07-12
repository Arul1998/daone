import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TrustedContact } from '../../../models/trusted-contact';
import { TrustedContactService } from '../../../services/trusted-contact';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-contact-archived-detail',
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './contact-archived-detail.html',
  styleUrl: './contact-archived-detail.css',
})
export class ContactArchivedDetail implements OnInit {
  private readonly contactService = inject(TrustedContactService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly contact = signal<TrustedContact | null>(null);
  protected readonly loading = signal(true);
  protected readonly restoring = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly showRestoreConfirm = signal(false);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      await this.router.navigate(['/contacts/archived']);
      return;
    }

    await this.loadContact(id);
  }

  protected openRestoreConfirm(): void {
    this.showRestoreConfirm.set(true);
  }

  protected closeRestoreConfirm(): void {
    this.showRestoreConfirm.set(false);
  }

  protected async confirmRestore(): Promise<void> {
    const currentContact = this.contact();

    if (!currentContact) {
      return;
    }

    this.restoring.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const restored = await this.contactService.restore(currentContact.id);
      this.successMessage.set('Contact restored successfully.');
      await this.router.navigate(['/contacts', restored.id]);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not restore this contact.',
      );
      this.closeRestoreConfirm();
    } finally {
      this.restoring.set(false);
    }
  }

  private async loadContact(id: string): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const contact = await this.contactService.getById(id);

      if (!contact || contact.status !== 0) {
        await this.router.navigate(['/contacts/archived']);
        return;
      }

      this.contact.set(contact);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load this archived contact.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
