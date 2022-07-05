import { NextApiRequest, NextApiResponse } from 'next';
import { verifyCsrfToken } from '../../../util/auth';
import cloudinary from '../../../util/cloudinary';
import {
  createUserStory,
  deleteStory,
  getAllStories,
  getCsrfSeedByValidUserToken,
} from '../../../util/database';

export default async function storiesHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  console.log(req.body);
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
      const uploadImgResponse = await cloudinary.uploader.upload(
        req.body.coverImg,
        {
          upload_preset: 'covers',
          width: 350,
          height: 350,
          crop: 'fit',
        },
      );
      const newStory = await createUserStory(
        req.body.title,
        req.body.description,
        req.body.userId,
        uploadImgResponse.eager[0].secure_url,
      );
      console.log(newStory);
      console.log(req.body);
      res.status(200).json({ newStory });
      return;
    }
    if (req.method === 'DELETE') {
      const { id } = await deleteStory(req.body.storyId);
      res.status(200).json({ id });
      return;
    }
  }
  if (req.method === 'GET') {
    const stories = await getAllStories();
    res.status(200).json({ stories });
    return;
  }
  res.status(403).json({ error: [{ message: 'Method not allowed' }] });
}
