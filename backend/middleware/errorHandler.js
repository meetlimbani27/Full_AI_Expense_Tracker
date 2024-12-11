// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
};
