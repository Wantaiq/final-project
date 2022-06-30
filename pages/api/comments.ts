import { NextApiRequest, NextApiResponse } from 'next';
import { verifyCsrfToken } from '../../util/auth';
import {
  createNewComment,
  getCsrfSeedByValidUserToken,
} from '../../util/database';

export default async function commentsHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log(req.body);
  const sessionToken = req.cookies.sessionToken;
  if (!sessionToken) {
    res.status(405).json({ error: [{ message: 'Unauthorized' }] });
    return;
  }
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
    const newComment = await createNewComment(
      req.body.storyId,
      req.body.userId,
      req.body.content,
    );
    res.status(200).json({ newComment });
    return;
  }
  res.status(405).json({ error: [{ message: 'Method not allowed' }] });
  return;
}
