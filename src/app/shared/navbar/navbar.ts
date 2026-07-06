import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly isLoggedIn = this.auth.isLoggedIn;
  protected readonly menuOpen = signal(false);

  protected readonly publicLinks = [
    { label: 'Home', path: '/', exact: true },
    { label: 'Login', path: '/login', exact: false },
    { label: 'Register', path: '/register', exact: false },
  ];

  protected readonly privateLinks = [
    { label: 'Home', path: '/', exact: true },
    { label: 'Dashboard', path: '/dashboard', exact: false },
  ];

  async ngOnInit(): Promise<void> {
    await this.auth.init();
  }

  protected navLinks() {
    return this.isLoggedIn() ? this.privateLinks : this.publicLinks;
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected async logout(): Promise<void> {
    this.closeMenu();
    await this.auth.signOut();
    await this.router.navigate(['/']);
  }
}
