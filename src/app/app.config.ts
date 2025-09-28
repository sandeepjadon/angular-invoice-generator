import { ApplicationConfig, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
// import { provideTablerIcons } from 'angular-tabler-icons';
// import * as TablerIcons from 'angular-tabler-icons/icons';
// import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import ApPreset from '../appreset';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import localeIn from '@angular/common/locales/en-IN';
import { registerLocaleData } from '@angular/common';


registerLocaleData(localeIn);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // provideRouter(routes),
    // provideTablerIcons(TablerIcons),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),

    providePrimeNG({
      ripple: true,
      theme: {
        preset: ApPreset,
        options: {
          darkModeSelector: '.my-app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'app-styles, primeng, another-css-library',
          },
        },
      },
    }),
    // provideHttpClient(
    //   withInterceptors([authInterceptor, errorInterceptor])      // uncomment if you want to add authorization for api 
    // ),
    { provide: LOCALE_ID, useValue: 'en-IN' }
  ],
};
