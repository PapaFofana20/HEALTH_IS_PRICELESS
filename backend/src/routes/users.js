import { Router } from 'express';
import { findUserById, updateUser, getPublicUser } from '../services/userService.js';
import { authMiddleware } from '../middleware/auth.js';
import { programs } from '../data/programs.js';

const router = Router();

const knownProgramIds = new Set(programs.map((p) => p.id));

function isKnownProgramId(id) {
  return typeof id === 'string' && knownProgramIds.has(id);
}

router.get('/:userId', authMiddleware, async (req, res, next) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    const user = await findUserById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    res.json({ user: getPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.patch('/:userId', authMiddleware, async (req, res, next) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    const { goal, currentProgramId, currentWeek, weightGoal, firstName, lastName } = req.body ?? {};
    const updates = {};
    if (goal === 'weight-loss' || goal === 'muscle-gain') updates.goal = goal;
    if (currentProgramId === null) {
      updates.currentProgramId = null;
    } else if (typeof currentProgramId === 'string' && currentProgramId) {
      if (!isKnownProgramId(currentProgramId)) {
        return res.status(400).json({ error: 'INVALID_INPUT', message: 'programId inconnu' });
      }
      updates.currentProgramId = currentProgramId;
    }
    if (Number.isInteger(currentWeek) && currentWeek > 0 && currentWeek <= 52) updates.currentWeek = currentWeek;
    if (typeof weightGoal === 'number' && weightGoal >= 30 && weightGoal <= 300) updates.weightGoal = weightGoal;
    if (typeof firstName === 'string' && firstName.trim()) updates.firstName = firstName.trim();
    if (typeof lastName === 'string') updates.lastName = lastName.trim();
    const user = await updateUser(req.params.userId, updates);
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    res.json({ user: getPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/:userId/favorites/:programId', authMiddleware, async (req, res, next) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    const { programId } = req.params;
    if (!isKnownProgramId(programId)) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'programId inconnu' });
    }
    const user = await findUserById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    const favorites = Array.isArray(user.favorites) ? [...user.favorites] : [];
    const index = favorites.indexOf(programId);
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(programId);
    }
    const updated = await updateUser(req.params.userId, { favorites });
    res.json({ favorites: updated?.favorites ?? favorites });
  } catch (err) {
    next(err);
  }
});

router.get('/:userId/favorites', authMiddleware, async (req, res, next) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    const user = await findUserById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    res.json({ favorites: user.favorites });
  } catch (err) {
    next(err);
  }
});

router.post('/:userId/start-program', authMiddleware, async (req, res, next) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    const user = await findUserById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    const { programId } = req.body ?? {};
    if (typeof programId !== 'string' || !programId) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'programId requis' });
    }
    if (!isKnownProgramId(programId)) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'programId inconnu' });
    }
    const updated = await updateUser(req.params.userId, { currentProgramId: programId, currentWeek: 1 });
    if (!updated) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    res.json({ user: getPublicUser(updated) });
  } catch (err) {
    next(err);
  }
});

export { router as usersRouter };