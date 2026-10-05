export function errorHandler(err, req, res, next) {
  console.error(err.message ?? err);
  if (err.name === 'ValidationError' || err.message === 'INVALID_PASSWORD') {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: err.message });
  }
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token invalide' });
  }
  // CORS refusé (server.js) -> 403, pas 500.
  if (err.message === 'Origine non autorisée par CORS' || err.message === 'Origine requise en production' || err.code === 'CORS_FORBIDDEN') {
    return res.status(403).json({ error: 'FORBIDDEN', message: err.message });
  }
  // JSON malformé (express.json) -> 400.
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && 'body' in err) || (err.statusCode === 400 && err.message.includes('JSON'))) {
    return res.status(400).json({ error: 'INVALID_JSON', message: 'Corps JSON invalide' });
  }
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Erreur interne du serveur' });
}
