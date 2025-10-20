import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AuthComponent } from './components/auth/auth.component';
import { ProfileComponent } from './components/profile/profile.component';
import { UploadComponent } from './components/upload/upload.component';
import { LayoutComponent } from './components/shared/layout.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'auth', component: AuthComponent },
    { 
        path: '', 
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'home', component: HomeComponent },
            { path: 'profile', component: ProfileComponent },
            { path: 'upload', component: UploadComponent },
            { path: '', redirectTo: '/home', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: '/auth' }
];
