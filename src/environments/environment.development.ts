// Development environment.
// Each service is called via "/api/<service>/..." and forwarded by the dev
// proxy (proxy.conf.js) to the ALB, avoiding browser CORS.
export const environment = {
  production: false,
  appName: 'Sapumal Theatre',
  services: {
    identity: '/api/identity',
    catalogue: '/api/catalogue',
    booking: '/api/booking',
  },
};
