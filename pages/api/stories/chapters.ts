import { NextApiRequest, NextApiResponse } from 'next';
import { verifyCsrfToken } from '../../../util/auth';
import {
  createChapter,
  getCsrfSeedByValidUserToken,
} from '../../../util/database';

export default async function chaptersHandler(
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
      const newChapter = await createChapter(
        req.body.storyId,
        req.body.heading,
        req.body.content,
        req.body.sortPosition,
      );
      res.status(200).json({ newChapter });
      return;
    }
  }
  res.status(405).json({ error: [{ message: 'Method not allowed' }] });
}
