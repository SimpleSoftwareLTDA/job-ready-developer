import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/map/map.component').then(m => m.MapComponent),
    title: 'Job Ready Developer — Mapa de Conhecimento'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent),
    title: 'Login — Job Ready Developer'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard],
    title: 'Meu Progresso — Job Ready Developer'
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, adminGuard],
    title: 'Admin — Job Ready Developer'
  },
  { path: '**', redirectTo: '' }
];
