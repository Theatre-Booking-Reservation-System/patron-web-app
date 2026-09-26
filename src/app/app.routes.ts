import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Auth pages (outside any shell chrome).
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },

  // Public pages (each renders its own header + footer).
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'productions',
    loadComponent: () =>
      import('./features/productions/productions.component').then((m) => m.ProductionsComponent),
  },
  {
    path: 'productions/:id',
    loadComponent: () =>
      import('./features/booking/production-details/production-details.component').then(
        (m) => m.ProductionDetailsComponent,
      ),
  },

  // Booking flow steps.
  {
    path: 'book/:id/performance',
    loadComponent: () =>
      import('./features/booking/select-performance/select-performance.component').then(
        (m) => m.SelectPerformanceComponent,
      ),
  },
  {
    path: 'book/:id/seats',
    loadComponent: () =>
      import('./features/booking/seat-selection/seat-selection.component').then(
        (m) => m.SeatSelectionComponent,
      ),
  },
  {
    path: 'book/:id/details',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/booking/booking-details/booking-details.component').then(
        (m) => m.BookingDetailsComponent,
      ),
  },
  {
    path: 'book/:id/payment',
    loadComponent: () =>
      import('./features/booking/payment/payment.component').then((m) => m.PaymentComponent),
  },
  {
    path: 'book/:id/confirmation',
    loadComponent: () =>
      import('./features/booking/confirmation/confirmation.component').then(
        (m) => m.ConfirmationComponent,
      ),
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'plan-your-visit',
    loadComponent: () => import('./features/visit/visit.component').then((m) => m.VisitComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/contact/contact.component').then((m) => m.ContactComponent),
  },

  // E-Ticket (shown after a booking is confirmed).
  {
    path: 'ticket',
    loadComponent: () => import('./features/ticket/ticket.component').then((m) => m.TicketComponent),
  },

  // Authenticated customer area (only accessible after login).
  {
    path: 'my-bookings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/account/my-bookings/my-bookings.component').then(
        (m) => m.MyBookingsComponent,
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/account/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    // Public: anyone can view the loyalty programme; enrolling requires login.
    path: 'loyalty',
    loadComponent: () =>
      import('./features/loyalty/loyalty.component').then((m) => m.LoyaltyComponent),
  },

  // Legal.
  {
    path: 'privacy',
    loadComponent: () => import('./features/legal/privacy.component').then((m) => m.PrivacyComponent),
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/legal/terms.component').then((m) => m.TermsComponent),
  },
  {
    path: 'support',
    loadComponent: () => import('./features/legal/support.component').then((m) => m.SupportComponent),
  },

  // Standalone connection-error page (full-screen, no header/footer chrome).
  {
    path: 'connection-error',
    loadComponent: () =>
      import('./features/connection-error/connection-error.component').then(
        (m) => m.ConnectionErrorComponent,
      ),
  },

  { path: '**', redirectTo: '' },
];
