import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TrustedContact } from '../../../models/trusted-contact';
import { TrustedContactService } from '../../../services/trusted-contact';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-contact-detail',
  imports: [RouterLink, ConfirmDialog],
  templateUrl: './contact-detail.html',
  styleUrl: './contact-detail.css',
})
export class ContactDetail implements OnInit {
  private readonly contactService = inject(TrustedContactService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly contact = signal<TrustedContact | null>(null);
  protected readonly loading = signal(true);
  protected readonly archiving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly showArchiveConfirm = signal(false);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      await this.router.navigate(['/contacts']);
      return;
    }

    await this.loadContact(id);
  }

  protected openArchiveConfirm(): void {
    this.showArchiveConfirm.set(true);
  }

  protected closeArchiveConfirm(): void {
    this.showArchiveConfirm.set(false);
  }

  protected async confirmArchive(): Promise<void> {
    const currentContact = this.contact();

    if (!currentContact) {
      return;
    }

    this.archiving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      await this.contactService.archive(currentContact.id);
      this.successMessage.set('Contact archived successfully.');
      await this.router.navigate(['/contacts']);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not archive this contact.',
      );
      this.closeArchiveConfirm();
    } finally {
      this.archiving.set(false);
    }
  }

  private async loadContact(id: string): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const contact = await this.contactService.getById(id);

      if (!contact || contact.status !== 1) {
        if (contact?.status === 0) {
          await this.router.navigate(['/contacts/archived', contact.id]);
          return;
        }

        await this.router.navigate(['/contacts']);
        return;
      }

      this.contact.set(contact);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Could not load this contact.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
