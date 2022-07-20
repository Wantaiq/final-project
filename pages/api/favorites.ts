import { NextApiRequest, NextApiResponse } from 'next';
import { verifyCsrfToken } from '../../util/auth';
import {
  favoriteStory,
  getCsrfSeedByValidUserToken,
  removeFromFavorites,
} from '../../util/database';

export default async function favoritesHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const sessionToken = req.cookies.sessionToken;
  if (!sessionToken) {
    res.status(401).json({ error: [{ message: 'Unauthorized' }] });
    return;
  }
  if (!req.body.csrfToken) {
    res.status(401).json({ error: [{ message: 'Unauthorized' }] });
    return;
  }
  const { csrfSeed } = await getCsrfSeedByValidUserToken(
    req.cookies.sessionToken,
  );
  if (!verifyCsrfToken(csrfSeed, req.body.csrfToken)) {
    res.status(401).json({ error: [{ message: 'Unauthorized' }] });
    return;
  }
  if (req.method === 'POST') {
    await favoriteStory(req.body.storyId, req.body.userId);
    res.status(200).json({ message: 'Success' });
    return;
  }
  if (req.method === 'DELETE') {
    const removedFavoriteStory = await removeFromFavorites(
      req.body.storyId,
      req.body.userId,
    );
    res.status(200).json({ removedFavoriteStory });
    return;
  }
  res.status(405).json({ error: [{ message: 'Method not allowed' }] });
  return;
}
