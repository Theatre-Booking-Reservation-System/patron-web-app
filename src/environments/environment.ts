// Production/default environment.
//
// The app calls each backend microservice via a relative "/<service>/..." path.
// The host (Netlify / Vercel) proxies those paths server-side to the HTTP
// backend. Because the browser only ever makes HTTPS calls to the app's OWN
// origin, there is no CORS and no HTTP/HTTPS mixed-content problem — the plain
// HTTP hop happens on the host's servers, not in the browser.
//
// Proxy mapping lives in netlify.toml (and vercel.json):
//   /identity-service/*  ->  http://ec2-.../identity-service/*
export const environment = {
  production: true,
  appName: 'Sapumal Theatre',
  services: {
    identity: '/identity-service',
    catalogue: '/catalogue-service',
    seat: '/seat-service',
    booking: '/booking-service',
  },
};
