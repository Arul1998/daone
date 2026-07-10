import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { AssetArchivedDetail } from './pages/assets/asset-archived-detail/asset-archived-detail';
import { AssetArchivedList } from './pages/assets/asset-archived-list/asset-archived-list';
import { AssetDetail } from './pages/assets/asset-detail/asset-detail';
import { AssetForm } from './pages/assets/asset-form/asset-form';
import { AssetList } from './pages/assets/asset-list/asset-list';
import { Dashboard } from './pages/dashboard/dashboard';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'assets/archived/:id', component: AssetArchivedDetail, canActivate: [authGuard] },
  { path: 'assets/archived', component: AssetArchivedList, canActivate: [authGuard] },
  { path: 'assets/new', component: AssetForm, canActivate: [authGuard] },
  { path: 'assets/:id/edit', component: AssetForm, canActivate: [authGuard] },
  { path: 'assets/:id', component: AssetDetail, canActivate: [authGuard] },
  { path: 'assets', component: AssetList, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
