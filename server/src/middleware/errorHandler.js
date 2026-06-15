// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error('[error]', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate value', detail: err.keyValue });
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
}
