import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  createUserWithHashedPassword,
  getUserByUsername,
} from '../../util/database';
import authenticateUser from '../../util/middleware/authentication';
import { authenticationSchema } from '../../util/schema/authentication';

export type ResponseBody =
  | {
      user: {
        id: number;
        username: string;
      };
    }
  | { error: { message: string }[] };
async function registrationHandler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>,
) {
  if (await getUserByUsername(req.body.username)) {
    res
      .status(400)
      .json({ error: [{ message: 'Please choose different username' }] });
    return;
  }
  const passwordHash = await bcrypt.hash(req.body.password, 12);
  const newUser = await createUserWithHashedPassword(
    req.body.username,
    passwordHash,
  );
  res
    .status(200)
    .json({ user: { id: newUser.id, username: newUser.username } });
}

export default authenticateUser(authenticationSchema, registrationHandler);
