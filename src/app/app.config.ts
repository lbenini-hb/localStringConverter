import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { HomeComponent } from './home.component';
import { Base64Component } from './base64.component';
import { JwtComponent } from './jwt.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Hash URLs (#/jwt) so refreshes and deep links work on GitHub Pages without a 404.html hack.
    provideRouter(
      [
        { path: '', component: HomeComponent, title: 'Local String Converter' },
        { path: 'base64', component: Base64Component, title: 'Base64 · Local String Converter' },
        { path: 'jwt', component: JwtComponent, title: 'JWT · Local String Converter' },
        { path: '**', redirectTo: '' },
      ],
      withHashLocation(),
    ),
  ],
};
