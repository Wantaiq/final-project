import { NextApiRequest, NextApiResponse } from 'next';
import { getUserProfileByValidSessionToken } from '../../util/database';

export default async function profileHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: [{ message: 'Method not allowed' }] });
    return;
  }
  const sessionToken = req.cookies.sessionToken;
  if (!sessionToken) {
    res.status(405).json({ error: [{ message: 'Unauthorized' }] });
    return;
  }
  const userProfile = await getUserProfileByValidSessionToken(sessionToken);
  if (!userProfile) {
    res.status(405).json({ error: [{ message: 'Unauthorized' }] });
    return;
  }
  res.status(200).json({ username: userProfile.username });
}
