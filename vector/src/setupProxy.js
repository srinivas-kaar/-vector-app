module.exports = function(app) {
  app.use((req, res, next) => {
    res.removeHeader('X-Frame-Options');
    next();
  });
};