import { GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import { FormEvent, SyntheticEvent, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  getUserProfileByValidSessionToken,
  UserProfile,
} from '../../util/database';

type Props = {
  userProfile: UserProfile;
};
export default function Settings(props: Props) {
  const [userBio, setUserBio] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>('');
  const [avatarImgInput, setAvatarImgInput] = useState('');
  function previewImg(img) {
    const reader = new FileReader();
    reader.readAsDataURL(img);
    reader.onloadend = () => {
      setSelectedFile(reader.result);
    };
  }
  function handleAvatarInput(event) {
    const uploadedImg = event.target.files[0];
    previewImg(uploadedImg);
    setAvatarImgInput(event.currentTarget.value);
  }

  function handleSubmitSettings(event: FormEvent) {
    event.preventDefault();
  }

  return (
    <div className="w-[75%] mx-auto mt-24">
      <form
        className="flex flex-col items-center space-y-4"
        onSubmit={(e) => handleSubmitSettings(e)}
      >
        <div className="bg-white w-[175px] h-[175px] rounded-full">
          <Image
            src={
              selectedFile
                ? selectedFile
                : `https://res.cloudinary.com/dxbam2d2r/image/upload/v1656662127/avatars/three-dogs.jpg`
            }
            width={175}
            height={175}
          />
        </div>
        <label
          htmlFor="uploadAvatar"
          className="font-bold text-2xl tracking-wide mb-6 bg-amber-700 px-[1em] py-[.2em] cursor-pointer"
        >
          Select image
        </label>
        <input
          id="uploadAvatar"
          type="file"
          accept=".jpg, .png, .jpeg"
          hidden
          value={avatarImgInput}
          onChange={(event) => handleAvatarInput(event)}
        />
        <label htmlFor="userBio">Update your bio</label>
        <textarea
          className="text-black indent-4"
          id="userBio"
          value={userBio}
          onChange={(e) => setUserBio(e.currentTarget.value)}
          placeholder={
            props.userProfile.bio === null
              ? 'About you ...'
              : props.userProfile.bio
          }
        />
        <p>* This information will be visible to other users.</p>
        <button className="font-bold text-2xl tracking-wide mb-6 bg-amber-700 px-[1em] py-[.2em] cursor-pointer">
          Save and exit
        </button>
      </form>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userProfile = await getUserProfileByValidSessionToken(
    context.req.cookies.sessionToken,
  );
  if (!userProfile) {
    return {
      redirect: {
        destination: '/login?returnTo=/profile',
        permanent: false,
      },
    };
  }
  return { props: { userProfile } };
}
