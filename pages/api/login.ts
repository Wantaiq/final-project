import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserWithHashedPassword } from '../../util/database';
import authenticateUser from '../../util/middleware/authentication';
import { authenticationSchema } from '../../util/schema/authentication';

async function loginHandler(req: NextApiRequest, res: NextApiResponse) {
  const userWithHash = await getUserWithHashedPassword(req.body.username);
  if (!userWithHash) {
    res
      .status(400)
      .json({ error: [{ message: 'Invalid username or password' }] });
    return;
  }
  const isUserAuthenticated = await bcrypt.compare(
    req.body.password,
    userWithHash.passwordHash,
  );
  if (!isUserAuthenticated) {
    res
      .status(405)
      .json({ error: [{ message: 'Invalid username or password' }] });
    return;
  }
  const userId = userWithHash.id;
  const username = userWithHash.username;
  res.status(200).json({ user: { id: userId, username } });
}

export default authenticateUser(authenticationSchema, loginHandler);
