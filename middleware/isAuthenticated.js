function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).send('Not authenticated');
  }
  
  module.exports = isAuthenticated;
  