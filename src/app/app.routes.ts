import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
    canActivate: [authGuard],
  },
  {
    path: 'assets/archived/:id',
    loadComponent: () =>
      import('./pages/assets/asset-archived-detail/asset-archived-detail').then(
        (m) => m.AssetArchivedDetail,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'assets/archived',
    loadComponent: () =>
      import('./pages/assets/asset-archived-list/asset-archived-list').then(
        (m) => m.AssetArchivedList,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'assets/new',
    loadComponent: () =>
      import('./pages/assets/asset-form/asset-form').then((m) => m.AssetForm),
    canActivate: [authGuard],
  },
  {
    path: 'assets/:id/edit',
    loadComponent: () =>
      import('./pages/assets/asset-form/asset-form').then((m) => m.AssetForm),
    canActivate: [authGuard],
  },
  {
    path: 'assets/:id',
    loadComponent: () =>
      import('./pages/assets/asset-detail/asset-detail').then((m) => m.AssetDetail),
    canActivate: [authGuard],
  },
  {
    path: 'assets',
    loadComponent: () =>
      import('./pages/assets/asset-list/asset-list').then((m) => m.AssetList),
    canActivate: [authGuard],
  },
  {
    path: 'loans/archived/:id',
    loadComponent: () =>
      import('./pages/loans/loan-archived-detail/loan-archived-detail').then(
        (m) => m.LoanArchivedDetail,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'loans/archived',
    loadComponent: () =>
      import('./pages/loans/loan-archived-list/loan-archived-list').then(
        (m) => m.LoanArchivedList,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'loans/new',
    loadComponent: () => import('./pages/loans/loan-form/loan-form').then((m) => m.LoanForm),
    canActivate: [authGuard],
  },
  {
    path: 'loans/:id/edit',
    loadComponent: () => import('./pages/loans/loan-form/loan-form').then((m) => m.LoanForm),
    canActivate: [authGuard],
  },
  {
    path: 'loans/:id',
    loadComponent: () =>
      import('./pages/loans/loan-detail/loan-detail').then((m) => m.LoanDetail),
    canActivate: [authGuard],
  },
  {
    path: 'loans',
    loadComponent: () => import('./pages/loans/loan-list/loan-list').then((m) => m.LoanList),
    canActivate: [authGuard],
  },
  {
    path: 'insurance/archived/:id',
    loadComponent: () =>
      import('./pages/insurance/policy-archived-detail/policy-archived-detail').then(
        (m) => m.PolicyArchivedDetail,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'insurance/archived',
    loadComponent: () =>
      import('./pages/insurance/policy-archived-list/policy-archived-list').then(
        (m) => m.PolicyArchivedList,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'insurance/new',
    loadComponent: () =>
      import('./pages/insurance/policy-form/policy-form').then((m) => m.PolicyForm),
    canActivate: [authGuard],
  },
  {
    path: 'insurance/:id/edit',
    loadComponent: () =>
      import('./pages/insurance/policy-form/policy-form').then((m) => m.PolicyForm),
    canActivate: [authGuard],
  },
  {
    path: 'insurance/:id',
    loadComponent: () =>
      import('./pages/insurance/policy-detail/policy-detail').then((m) => m.PolicyDetail),
    canActivate: [authGuard],
  },
  {
    path: 'insurance',
    loadComponent: () =>
      import('./pages/insurance/policy-list/policy-list').then((m) => m.PolicyList),
    canActivate: [authGuard],
  },
  {
    path: 'contacts/archived/:id',
    loadComponent: () =>
      import('./pages/contacts/contact-archived-detail/contact-archived-detail').then(
        (m) => m.ContactArchivedDetail,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'contacts/archived',
    loadComponent: () =>
      import('./pages/contacts/contact-archived-list/contact-archived-list').then(
        (m) => m.ContactArchivedList,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'contacts/new',
    loadComponent: () =>
      import('./pages/contacts/contact-form/contact-form').then((m) => m.ContactForm),
    canActivate: [authGuard],
  },
  {
    path: 'contacts/:id/edit',
    loadComponent: () =>
      import('./pages/contacts/contact-form/contact-form').then((m) => m.ContactForm),
    canActivate: [authGuard],
  },
  {
    path: 'contacts/:id',
    loadComponent: () =>
      import('./pages/contacts/contact-detail/contact-detail').then((m) => m.ContactDetail),
    canActivate: [authGuard],
  },
  {
    path: 'contacts',
    loadComponent: () =>
      import('./pages/contacts/contact-list/contact-list').then((m) => m.ContactList),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '' },
];
