//  Dev proxy for the Angular dev server (avoids browser CORS in development).

const ALB_HOST =
  process.env.ALB_HOST || 'http://theatre-alb-1442845415.us-east-1.elb.amazonaws.com';

// Map the app's service key
const SERVICES = {
  identity: 'identity-service',
  catalogue: 'catalogue-service',
  booking: 'booking-service',
};

module.exports = Object.entries(SERVICES).reduce((cfg, [name, albPath]) => {
  cfg[`/api/${name}`] = {
    target: ALB_HOST,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: { [`^/api/${name}`]: `/${albPath}` },
  };
  return cfg;
}, {});
