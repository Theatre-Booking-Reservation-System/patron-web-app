//  Dev proxy for the Angular dev server (avoids browser CORS in development).
//
//  The browser calls "/api/<service>/..." and the dev server forwards it to the
//  backend host, rewriting the prefix to the service's path on the host.
//    /api/catalogue/productions  ->  <HOST>/catalogue-service/productions

const HOST =
  process.env.API_HOST || 'http://ec2-3-237-240-69.compute-1.amazonaws.com';

// Map the app's service key -> the backend path prefix on the host.
const SERVICES = {
  identity: 'identity-service',
  catalogue: 'catalogue-service',
  seat: 'seat-service',
  booking: 'booking-service',
};

module.exports = Object.entries(SERVICES).reduce((cfg, [name, backendPath]) => {
  cfg[`/api/${name}`] = {
    target: HOST,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
    pathRewrite: { [`^/api/${name}`]: `/${backendPath}` },
  };
  return cfg;
}, {});
