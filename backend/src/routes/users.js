import { Router } from 'express';
import { findUserById, updateUser, getPublicUser } from '../services/userService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/:userId', authMiddleware, async (req, res) => {
  if (req.userId !== req.params.userId) {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  const user = await findUserById(req.params.userId);
  if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  res.json({ user: getPublicUser(user) });
});

router.patch('/:userId', authMiddleware, async (req, res) => {
  if (req.userId !== req.params.userId) {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  const { goal, currentProgramId, currentWeek, weightGoal, firstName, lastName } = req.body ?? {};
  const updates = {};
  if (goal === 'weight-loss' || goal === 'muscle-gain') updates.goal = goal;
  if (typeof currentProgramId === 'string' || currentProgramId === null) updates.currentProgramId = currentProgramId;
  if (Number.isInteger(currentWeek) && currentWeek > 0 && currentWeek <= 52) updates.currentWeek = currentWeek;
  if (typeof weightGoal === 'number' && weightGoal >= 30 && weightGoal <= 300) updates.weightGoal = weightGoal;
  if (typeof firstName === 'string' && firstName.trim()) updates.firstName = firstName.trim();
  if (typeof lastName === 'string') updates.lastName = lastName.trim();
  const user = await updateUser(req.params.userId, updates);
  if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  res.json({ user: getPublicUser(user) });
});

router.post('/:userId/favorites/:programId', authMiddleware, async (req, res) => {
  if (req.userId !== req.params.userId) {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  const user = await findUserById(req.params.userId);
  if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  const { programId } = req.params;
  const index = user.favorites.indexOf(programId);
  if (index > -1) {
    user.favorites.splice(index, 1);
  } else {
    user.favorites.push(programId);
  }
  await updateUser(req.params.userId, { favorites: user.favorites });
  res.json({ favorites: user.favorites });
});

router.get('/:userId/favorites', authMiddleware, async (req, res) => {
  if (req.userId !== req.params.userId) {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  const user = await findUserById(req.params.userId);
  if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  res.json({ favorites: user.favorites });
});

router.post('/:userId/start-program', authMiddleware, async (req, res) => {
  if (req.userId !== req.params.userId) {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
  const user = await findUserById(req.params.userId);
  if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  const { programId } = req.body ?? {};
  if (typeof programId !== 'string' || !programId) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'programId requis' });
  }
  const updated = await updateUser(req.params.userId, { currentProgramId: programId, currentWeek: 1 });
  if (!updated) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  res.json({ user: getPublicUser(updated) });
});

export { router as usersRouter };