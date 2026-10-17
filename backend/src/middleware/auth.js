const jwt = require('jsonwebtoken');

/** Verifies the Bearer JWT and attaches { id, role, name } to req.user. */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Duhet të identifikoheni' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesioni ka skaduar, identifikohuni përsëri' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Nuk keni leje për këtë veprim' });
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
