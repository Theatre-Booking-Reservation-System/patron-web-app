// Production/default environment.
// All microservices sit behind a single AWS ALB, routed by path prefix.
const ALB = 'http://theatre-alb-1442845415.us-east-1.elb.amazonaws.com';

export const environment = {
  production: true,
  appName: 'Sapumal Theatre',
  services: {
    identity: `${ALB}/identity-service`,
    catalogue: `${ALB}/catalogue-service`,
    booking: `${ALB}/booking-service`,
  },
};
