import { Routes } from '@angular/router';
import { authGuard } from './common/authGuard/auth.guard';
import { loginGuard } from './common/authGuard/login-guard.guard';

export const routes: Routes = [
    {path:"",
    canActivate:[authGuard],
    loadChildren: () => import('./modules/public-layout/publicLayout.route').then((m) => m.publicLayout)},
    {path:"admin",
    canActivate:[loginGuard],
    loadChildren: () => import('./modules/layout/layout.route').then((m) => m.layoutRoutes)},
];
