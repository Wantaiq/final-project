import { NextApiRequest, NextApiResponse } from 'next';
import { verifyCsrfToken } from '../../util/auth';
import {
  createNewComment,
  deleteComment,
  getCsrfSeedByValidUserToken,
} from '../../util/database';

export default async function commentsHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
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
  if (req.method === 'DELETE') {
    const deletedComment = await deleteComment(req.body.commentId);
    res.status(200).json({ deletedComment });
    return;
  }
  res.status(405).json({ error: [{ message: 'Method not allowed' }] });
  return;
}
