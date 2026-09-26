// Development environment.
// Each service is called via "/api/<service>/..." and forwarded by the dev
// proxy (proxy.conf.js) to the backend host, avoiding browser CORS.
export const environment = {
  production: false,
  appName: 'Sapumal Theatre',
  services: {
    identity: '/api/identity',
    catalogue: '/api/catalogue',
    seat: '/api/seat',
    booking: '/api/booking',
  },
};
