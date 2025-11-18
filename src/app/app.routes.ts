import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./components/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'donate',
    loadComponent: () => import('./components/donate/donate.component').then(m => m.DonateComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./components/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/auth/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'announcements',
    loadComponent: () => import('./components/announcements/announcements.component').then(m => m.AnnouncementsComponent)
  },
  {
    path: 'create-announcement',
    loadComponent: () => import('./components/announcements/create-announcement.component').then(m => m.CreateAnnouncementComponent)
  }
];