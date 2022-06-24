import { NextApiRequest, NextApiResponse } from 'next';
import { verifyCsrfToken } from '../../../util/auth';
import {
  createUserStory,
  deleteStory,
  getCsrfSeedByValidUserToken,
} from '../../../util/database';

export default async function storiesHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    if (!req.body.csrfToken) {
      res.status(405).json({ error: [{ message: 'Unauthorized' }] });
      return;
    }
    const { csrfSeed } = await getCsrfSeedByValidUserToken(
      req.cookies.sessionToken,
    );
    if (!verifyCsrfToken(csrfSeed, req.body.csrfToken)) {
      res.status(405).json({ error: [{ message: 'Unauthorized' }] });
      return;
    }
    if (req.method === 'POST') {
      const newStory = await createUserStory(
        req.body.title,
        req.body.description,
        req.body.userId,
      );
      res.status(200).json({ newStory });
      return;
    }
    if (req.method === 'DELETE') {
      const { id } = await deleteStory(req.body.storyId);
      res.status(200).json({ id });
    }
  }
}
