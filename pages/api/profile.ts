import { NextApiRequest, NextApiResponse } from 'next';
import { verifyCsrfToken } from '../../util/auth';
import cloudinary from '../../util/cloudinary';
import {
  getCsrfSeedByValidUserToken,
  getUserProfileByValidSessionToken,
  updateUserProfileAvatar,
  updateUserProfileBio,
} from '../../util/database';

export default async function profileHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
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
    res
      .status(200)
      .json({ username: userProfile.username, avatar: userProfile.avatar });
    return;
  }
  if (req.method === 'PUT') {
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
    if (req.body.userBio) {
      await updateUserProfileBio(req.body.userBio, userProfile.userId);
      res.status(200).json({ message: 'Success' });
      return;
    }
    if (req.body.img) {
      const uploadImgResponse = await cloudinary.uploader.upload(req.body.img, {
        upload_preset: 'avatars',
        width: 320,
        height: 320,
        crop: 'fit',
      });
      await updateUserProfileAvatar(
        uploadImgResponse.eager[0].secure_url,
        userProfile.userId,
      );
      res.status(200).json({ message: 'Success' });
      return;
    }
  }
  res.status(405).json({ error: [{ message: 'Method not allowed' }] });
}
