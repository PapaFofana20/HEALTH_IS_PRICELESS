export function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: err.message });
  }
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token invalide' });
  }
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Erreur interne du serveur' });
}
