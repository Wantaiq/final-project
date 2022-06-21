import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { ObjectShape, OptionalObjectSchema } from 'yup/lib/object';

export default function authenticateUser(
  schema: OptionalObjectSchema<ObjectShape>,
  handler: NextApiHandler,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
      res.status(405).json({ errors: [{ message: 'Method not allowed' }] });
      return;
    }
    try {
      await schema.validate(req.body, { stripUnknown: true });
    } catch (error) {
      res
        .status(400)
        .json({ error: [{ message: 'Invalid username or password' }] });
      return;
    }
    await handler(req, res);
  };
}
