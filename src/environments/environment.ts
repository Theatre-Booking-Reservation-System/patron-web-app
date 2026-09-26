// Production/default environment.
// All microservices sit behind a single host, routed by path prefix.
const HOST = 'http://ec2-3-237-240-69.compute-1.amazonaws.com';

export const environment = {
  production: true,
  appName: 'Sapumal Theatre',
  services: {
    identity: `${HOST}/identity-service`,
    catalogue: `${HOST}/catalogue-service`,
    seat: `${HOST}/seat-service`,
    booking: `${HOST}/booking-service`,
  },
};
