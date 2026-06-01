const jwt = require('jsonwebtoken');
const config = require('../config');

const verifyToken = (req, res, next) => {
  console.log('Full req.url:', req.url);
console.log('Original URL:', req.originalUrl);
  
  // --- NEW: allow the attendance sync endpoint with x-api-key ---
  if (req.url === '/sync' && req.headers['x-api-key']) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey === process.env.ZK_SYNC_API_KEY) {
      req.user = { role: 'service', id: 'zk-sync' };
      return next();
    } else {
      return res.status(401).json({ success: false, error: { message: 'Invalid API key', statusCode: 401 } });
    }
  }
  // --- END OF NEW CODE ---

  // Original JWT logic for all other routes
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'No token provided', statusCode: 401 }
      });
    }
    const decoded = jwt.verify(token, config.JWT.SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { message: 'Token has expired', statusCode: 401 }
      });
    }
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid token', statusCode: 401 }
    });
  }
};

const authorize = (allowedRoles) => {
  return (req, res, next) => {
    // Skip authorization for the sync endpoint
    if (req.url === '/sync' || req.originalUrl === '/api/attendance/sync') {
      return next();
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not authenticated', statusCode: 401 }
      });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied', statusCode: 403 }
      });
    }

    next();
  };
};

module.exports = { verifyToken, authorize };
