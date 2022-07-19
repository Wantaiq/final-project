import { GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useContext, useState } from 'react';
import { profileContext } from '../../context/ProfileProvider';
import { createCsrfToken } from '../../util/auth';
import {
  FavoriteStories,
  getAllFavoriteStoriesByUserId,
  getAllUserStoriesByUserId,
  getCsrfSeedByValidUserToken,
  getUserProfileByValidSessionToken,
  UserProfile,
  UserStory,
} from '../../util/database';

type Props = {
  userProfile: UserProfile;
  csrfToken: string;
  userStories: UserStory[];
  tab: string | undefined;
  favorites: FavoriteStories;
};

export default function Profile(props: Props) {
  const [userStories, setUserStories] = useState(props.userStories);

  const [numberOfStories, setNumberOfStories] = useState(
    props.userStories.length,
  );
  const [imgAvatarUploadError, setImgAvatarUploadError] = useState<
    string | undefined
  >(undefined);

  const [selectedAvatarImage, setSelectedAvatarImage] = useState<
    string | ArrayBuffer | null
  >('');
  const [avatarImgInput, setAvatarImgInput] = useState('');
  const [isAvatarUpdate, setIsAvatarUpdate] = useState(false);
  const [isUserBioUpdate, setIsUserBioUpdate] = useState(false);
  const [userBio, setUserBio] = useState(props.userProfile.bio);

  const { handleUserProfile } = useContext(profileContext);

  async function deleteStoryHandler(storyId: number) {
    const response = await fetch('/api/stories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        csrfToken: props.csrfToken,
        storyId,
      }),
    });
    const { id } = await response.json();
    setUserStories((prevState) => prevState.filter((story) => story.id !== id));
    setNumberOfStories((prevNumber) => prevNumber - 1);
  }

  async function handleSubmitProfileImage(event: FormEvent) {
    event.preventDefault();
    if (!selectedAvatarImage) {
      setIsAvatarUpdate(false);
      return;
    }
    setIsAvatarUpdate(false);
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        img: selectedAvatarImage,
        csrfToken: props.csrfToken,
      }),
    });
    if (!response.ok) {
      throw new Error();
    }
    setSelectedAvatarImage('');
    handleUserProfile();
  }

  function discardAvatarChanges() {
    setSelectedAvatarImage('');
    setIsAvatarUpdate(false);
  }

  function handleAvatarInput(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;
    if (event.target.files.length === 0) {
      setAvatarImgInput('');
      return;
    }
    const uploadedImg = event.target.files[0];
    const fileSize = Math.round(event.target.files[0].size / 1000);
    if (fileSize > 1000) {
      setImgAvatarUploadError('Maximum image size is 1MB');
      return;
    }
    setImgAvatarUploadError('');
    const reader = new FileReader();
    reader.readAsDataURL(uploadedImg);
    reader.onloadend = () => {
      setSelectedAvatarImage(reader.result);
    };
    setAvatarImgInput(event.currentTarget.value);
    return;
  }

  async function handleUserBioSubmit(event: FormEvent) {
    event.preventDefault();
    if (!userBio) {
      setIsUserBioUpdate(false);
      return;
    }
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userBio, csrfToken: props.csrfToken }),
    });
    setIsUserBioUpdate(false);
  }

  return (
    <>
      {/* Profile */}
      <div className="p-20 w-[65%] border-b-2 mx-auto flex justify-between">
        <div className="flex space-x-14">
          <div className="flex flex-col space-y-4">
            <div className="w-[320px] h-[320px] rounded-full border-2">
              {typeof selectedAvatarImage === 'string' && (
                <Image
                  src={
                    selectedAvatarImage
                      ? selectedAvatarImage
                      : props.userProfile.avatar
                  }
                  width={320}
                  height={320}
                  className="rounded-full"
                  alt="Profile picture"
                />
              )}
            </div>
            {isAvatarUpdate ? (
              <form onSubmit={(e) => handleSubmitProfileImage(e)}>
                <label
                  htmlFor="uploadAvatar"
                  className="font-bold text-2xl tracking-wide mb-6 bg-amber-700 px-[1em] py-[.2em] cursor-pointer"
                >
                  Select image
                </label>
                <p>{imgAvatarUploadError ? imgAvatarUploadError : null}</p>
                <input
                  id="uploadAvatar"
                  type="file"
                  accept=".jpg, .png, .jpeg"
                  hidden
                  value={avatarImgInput}
                  onChange={(event) => handleAvatarInput(event)}
                />
                <button disabled={imgAvatarUploadError ? true : false}>
                  Save and exit
                </button>
                <button onClick={() => discardAvatarChanges()}>
                  Discard changes
                </button>
              </form>
            ) : (
              <button
                className="bg-amber-600 py-[0.4em] rounded font-bold tracking-wider text-center"
                onClick={() => setIsAvatarUpdate(true)}
              >
                Update profile image
              </button>
            )}
          </div>
          <div className="space-y-8 mt-6">
            <h1 className="font-bold text-2xl tracking-wider text-amber-500">
              {props.userProfile.username}
            </h1>
            <p>
              <span className="font-bold text-3xl">{numberOfStories} </span>
              {numberOfStories === 1 ? 'Story' : 'Stories'}
            </p>
          </div>
        </div>
        {isUserBioUpdate ? (
          <form onSubmit={handleUserBioSubmit}>
            <label htmlFor="userBio">Update your bio</label>
            <textarea
              className="text-black indent-4"
              id="userBio"
              value={userBio ? userBio : ''}
              onChange={(event) => setUserBio(event.currentTarget.value)}
              placeholder={userBio === null ? 'About you ...' : userBio}
            />
            <p>* This information will be visible to other users.</p>
            <button className="font-bold text-2xl tracking-wide mb-6 bg-amber-700 px-[1em] py-[.2em] cursor-pointer">
              Save and exit
            </button>
          </form>
        ) : (
          <div>
            <h2 className="text-xl tracking-wide opacity-70">
              {!userBio
                ? `Mysterious person that loves to read and write stories`
                : userBio}
            </h2>
            <button onClick={() => setIsUserBioUpdate(true)}>Edit</button>
          </div>
        )}
      </div>
      {/* Tabs */}
      <div className="w-[65%] mx-auto flex justify-between px-44 py-6 border-b-2">
        <div
          className={`font-bold text-xl tracking-wide ${
            !props.tab && 'border-b-2 border-amber-600'
          } pb-[0.2em]`}
        >
          <Link href="/profile">Your stories</Link>
        </div>
        <div
          className={`font-bold text-xl tracking-wide ${
            props.tab === 'library' && 'border-b-2 border-amber-600'
          }`}
        >
          <Link href="/profile?tab=library">Library</Link>
        </div>
        <div
          className={`font-bold text-xl tracking-wide ${
            props.tab === 'messages' && 'border-b-2 border-amber-600'
          }`}
        >
          <Link href="/profile?tab=messages">Messages</Link>
        </div>
      </div>
      {!props.tab &&
        (props.userStories.length === 0 ? (
          <div className="mx-auto my-24 w-fit">
            <h1 className="font-bold text-3xl tracking-wide text-amber-600">
              You don't have any stories
            </h1>
            <Link href="/profile/create-story">
              <a>Create story</a>
            </Link>
          </div>
        ) : (
          <div className="w-[65%] mx-auto grid grid-cols-4 px-14 py-8 gap-7">
            <Link href="/profile/create-story">
              <a>Create story</a>
            </Link>
            {userStories.map((story) => {
              return (
                <div
                  key={`storyId-${story.id}`}
                  style={{ backgroundImage: `url(${story.coverImgUrl})` }}
                  className="border-2 px-6 pt-12 pb-6 rounded-lg bg-center bg-350 bg-no-repeat bg-[#242323] bg-blend-overlay w-[275px] h-[350px]"
                >
                  <h1 className="font-bold text-lg tracking-wide text-amber-400 mb-4 border-b-2 pb-4 text-shadow">
                    {story.title}
                  </h1>
                  <h2 className="font-medium tracking-wide text-shadow">
                    {!story.description
                      ? 'Someone ripped out description page.'
                      : story.description}
                  </h2>
                  <div className="flex flex-col">
                    <Link href={`/stories/${story.id}/overview`}>
                      <a className="mt-6 bg-amber-600 px-3 py-1 rounded-full font-bold text-center">
                        Read story
                      </a>
                    </Link>
                    <button
                      onClick={() => deleteStoryHandler(story.id)}
                      className="mt-6 bg-red-500 px-3 py-1 rounded-full font-bold"
                    >
                      Delete story
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      {props.tab === 'messages' && (
        <div>
          <h1>Hi</h1>
        </div>
      )}
      {props.tab === 'library' && (
        <div>
          {props.favorites.map((story) => {
            return (
              <div
                key={`favoriteStory-${story.storyId}`}
                style={{ backgroundImage: `url(${story.coverImgUrl})` }}
                className="w-[65%] mx-auto px-20 py-10 border-b-2 mt-6 flex justify-evenly items-center bg-no-repeat bg-cover bg-blend-overlay bg-[#242323]"
              >
                <a>Title : {story.title}</a>
                <p> Description : {story.description}</p>
                <p>Written by: {story.author}</p>
                <Link href={`/stories/${story.storyId}/overview`}>
                  <a className="mt-6 bg-amber-600 px-3 py-1 rounded-full font-bold text-center">
                    Read story
                  </a>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const tab = typeof context.query.tab === 'string' ? context.query.tab : null;
  const userProfile = await getUserProfileByValidSessionToken(
    context.req.cookies.sessionToken,
  );
  if (userProfile) {
    const userStories = await getAllUserStoriesByUserId(userProfile.userId);
    const { csrfSeed } = await getCsrfSeedByValidUserToken(
      context.req.cookies.sessionToken,
    );
    const favorites = await getAllFavoriteStoriesByUserId(userProfile.userId);
    const csrfToken = createCsrfToken(csrfSeed);
    return {
      props: {
        userProfile,
        csrfToken,
        userStories,
        tab,
        favorites,
      },
    };
  }
  return {
    redirect: {
      destination: '/login?returnTo=/profile',
      permanent: false,
    },
  };
}
