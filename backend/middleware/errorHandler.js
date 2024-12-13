// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
};
