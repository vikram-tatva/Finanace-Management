import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './public-layout.component';
import { authGuard } from '../../common/authGuard/auth.guard';

export const publicLayout: Routes = [
    {
        path:'',
        component:PublicLayoutComponent,
        children:[
            {
                path:'',
                loadComponent:()=>import('../public-layout/components/home/home.component').then((m)=>m.HomeComponent)
            },
            {
                path:'login',
                loadComponent:()=>import('../public-layout/components/login/login.component').then((m)=>m.LoginComponent)
            },
            {
                path:'aboutUs',
                loadComponent:()=>import('../public-layout/components/about-us/about-us.component').then((m)=>m.AboutUsComponent)
            },
            {
                path:'Registration',
                loadComponent:()=>import('../public-layout/components/registration/registration.component').then((m)=>m.RegistrationComponent)
            }
        ]
    }
]