import {
  Component,
  ElementRef,
  HostListener,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

export type ConfirmDialogVariant = 'danger' | 'primary';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly open = input(false);
  readonly title = input.required<string>();
  readonly titleId = input('confirm-dialog-title');
  readonly message = input('');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Cancel');
  readonly processing = input(false);
  readonly variant = input<ConfirmDialogVariant>('primary');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private previousFocus: HTMLElement | null = null;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.previousFocus = document.activeElement as HTMLElement | null;
        queueMicrotask(() => this.focusInitialElement());
        return;
      }

      this.restoreFocus();
    });
  }

  @HostListener('document:keydown', ['$event'])
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.open()) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.onCancel();
      return;
    }

    if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  protected onCancel(): void {
    if (this.processing()) {
      return;
    }

    this.cancelled.emit();
  }

  protected onConfirm(): void {
    if (this.processing()) {
      return;
    }

    this.confirmed.emit();
  }

  protected confirmButtonClass(): string {
    if (this.variant() === 'danger') {
      return 'inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60';
    }

    return 'inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60';
  }

  private focusInitialElement(): void {
    const panel = this.panel()?.nativeElement;

    if (!panel) {
      return;
    }

    const focusable = this.getFocusableElements(panel);
    focusable[0]?.focus();
  }

  private trapFocus(event: KeyboardEvent): void {
    const panel = this.panel()?.nativeElement;

    if (!panel) {
      return;
    }

    const focusable = this.getFocusableElements(panel);

    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
  }

  private restoreFocus(): void {
    if (this.previousFocus) {
      this.previousFocus.focus();
      this.previousFocus = null;
    }
  }
}
