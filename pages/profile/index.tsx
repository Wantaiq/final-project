import { BookOpenIcon, PencilIcon, TrashIcon } from '@heroicons/react/outline';
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

  const [favorites, setFavorites] = useState(props.favorites);

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

  async function removeFromFavorites(storyId: number, userId: number) {
    const response = await fetch('/api/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId, userId, csrfToken: props.csrfToken }),
    });
    const data = await response.json();
    setFavorites((prevState) =>
      prevState.filter(
        (story) => story.storyId !== data.removedFavoriteStory.storyId,
      ),
    );
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
    <main>
      <div className="flex h-full items-start">
        <section>
          <div className="flex flex-col items-center justify-start w-[30%] h-[1300px] px-14 py-20 pl-24 bg-ink-splatter bg-no-repeat bg-[right_top_200px] bg-[length:1000px] fixed">
            <div className="flex items-start justify-center space-x-6">
              <div className="flex flex-col items-center space-y-4">
                {typeof selectedAvatarImage === 'string' && (
                  <Image
                    src={
                      selectedAvatarImage
                        ? selectedAvatarImage
                        : props.userProfile.avatar
                    }
                    width={120}
                    height={120}
                    className="rounded-full"
                    alt="Profile picture"
                  />
                )}
                {isAvatarUpdate ? (
                  <form onSubmit={(e) => handleSubmitProfileImage(e)}>
                    <div className="flex flex-col items-center space-y-1">
                      <label
                        htmlFor="uploadAvatar"
                        className="p-[.7em] text-lg font-medium bg-no-repeat bg-center bg-ink-light bg-[length:175px] rounded-full text-slate-50 scale-100 duration-200 ease-in hover:bg-[length:190px] hover:scale-110 focus:bg-[length:190px] focus:scale-105 cursor-pointer"
                      >
                        Select image
                      </label>
                      <p>
                        {imgAvatarUploadError ? imgAvatarUploadError : null}
                      </p>
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
                    </div>
                  </form>
                ) : (
                  <button
                    className="font-medium p-[1em] bg-center bg-no-repeat bg-ink bg-[length:140px] rounded-full text-slate-50 scale-100 duration-200 ease-in hover:bg-[length:150px] hover:scale-110 focus:bg-[length:150px] focus:scale-110"
                    onClick={() => setIsAvatarUpdate(true)}
                  >
                    Edit image
                  </button>
                )}
              </div>
              {/* Profile details */}
              <div className="mt-6 flex flex-col space-y-2 items-center p-[1em] ">
                <p className="font-bold text-2xl tracking-wider text-[#2B6777f2]">
                  {props.userProfile.username}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="font-bold text-2xl">{numberOfStories}</p>
                  <p>{numberOfStories === 1 ? 'Story' : 'Stories'}</p>
                </div>
              </div>
            </div>
            <div className="flex mt-4">
              {isUserBioUpdate ? (
                <form onSubmit={handleUserBioSubmit}>
                  <div className="flex flex-col items-center space-y-2 w-[60%] mt-3">
                    <label
                      htmlFor="userBio"
                      className="text-[#2B6777f2] font-semibold tracking-wide"
                    >
                      Update bio
                    </label>
                    <textarea
                      className="text-black indent-4 resize-none"
                      id="userBio"
                      value={userBio ? userBio : ''}
                      onChange={(event) =>
                        setUserBio(event.currentTarget.value)
                      }
                      placeholder={userBio === null ? 'About you ...' : userBio}
                    />
                    <button className="p-[.7em] text-lg font-medium bg-no-repeat bg-center bg-ink-light bg-[length:185px] rounded-full text-slate-50 scale-100 duration-200 ease-in hover:bg-[length:190px] hover:scale-110 focus:bg-[length:190px] focus:scale-105 cursor-pointer">
                      Save and exit
                    </button>
                    <p className="text-red-500 font-bold">
                      * This information will be visible to other users.
                    </p>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-start justify-center space-y-2">
                  <p className="text-xl tracking-wide text-[#2B6777f2] font-bold">
                    {!userBio
                      ? `Mysterious person that loves to read and write stories.`
                      : userBio}
                  </p>
                  <button
                    aria-label="Edit bio"
                    onClick={() => setIsUserBioUpdate(true)}
                    className="relative bottom-8 left-20"
                  >
                    <PencilIcon width="40" height="40" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
        {/* Tabs */}
        <div className="mt-10 w-[60%] relative left-[30%]">
          <div className="flex py-6 justify-around shadow-md shadow-[#2B6777f2] ">
            <Link href="/profile">
              <a
                className={`font-bold text-xl  tracking-wide bg-[length:210px] bg-no-repeat p-[1.2em] bg-center bg-ink text-slate-50 scale-100 duration-200 ease-in hover:bg-[length:215px] hover:scale-110 focus:bg-[length:215px] focus:scale-105 ${
                  !props.tab && 'bg-ink-light'
                }`}
              >
                Your stories
              </a>
            </Link>
            <Link href="/profile?tab=library">
              <a
                className={`font-bold text-xl tracking-wide bg-[length:160px] bg-no-repeat rounded-full bg-center bg-ink text-slate-50 p-[1.3em] scale-100 duration-200 ease-in hover:bg-[length:170px] hover:scale-110 focus:bg-[length:170px] focus:scale-105 ${
                  props.tab === 'library' && 'bg-ink-light'
                }`}
              >
                Library
              </a>
            </Link>
            <Link href="/profile?tab=messages">
              <a
                className={`font-bold text-xl tracking-wide bg-[length:200px] bg-no-repeat bg-center rounded-full bg-ink text-slate-50 p-[1.3em] scale-100 duration-200 ease-in hover:bg-[length:210px] hover:scale-110 focus:bg-[length:210px] focus:scale-105 ${
                  props.tab === 'messages' && 'bg-ink-light'
                }`}
              >
                Messages
              </a>
            </Link>
          </div>
          {!props.tab &&
            (userStories.length === 0 ? (
              <section>
                <div className="flex justify-center items-center flex-col mt-20 space-y-6">
                  <p className="font-bold text-3xl tracking-wide text-[#2B6777f2]">
                    You don't have any stories
                  </p>
                  <Link href="/profile/create-story">
                    <a className="font-bold text-xl tracking-wide bg-[length:200px] bg-no-repeat bg-center rounded-full bg-ink text-slate-50 p-[1.3em] scale-100 duration-200 ease-in hover:bg-[length:210px] hover:scale-110 focus:bg-[length:210px] focus:scale-105">
                      Create story
                    </a>
                  </Link>
                </div>
              </section>
            ) : (
              <section>
                <div className="w-fit ml-auto my-[3em]">
                  <Link href="/profile/create-story">
                    <a className="font-bold tracking-wide bg-[length:230px] bg-no-repeat bg-center bg-ink text-slate-50 p-[1.5em] scale-100 duration-200 ease-in hover:bg-[length:240px] hover:scale-110 focus:bg-[length:240px] focus:scale-105">
                      Create new story
                    </a>
                  </Link>
                </div>
                <div className="w-[95%] mx-auto h-full grid grid-cols-2 gap-4">
                  {userStories.map((story) => {
                    return (
                      <div
                        key={`storyId-${story.id}`}
                        className="w-full shrink-0"
                      >
                        <div className="flex">
                          <div className="shrink-0">
                            <Image
                              src={story.coverImgUrl}
                              alt={`${story.title} book cover`}
                              width="200"
                              height="250"
                              className="rounded-lg"
                            />
                          </div>
                          <div className="py-4 px-4 flex flex-col justify-between break-all">
                            <div className="space-y-2">
                              <p className="text-[#2B6777f2] font-bold tracking-wide">
                                {story.title}
                              </p>
                              <p className="font-semibold text-sm line-clamp-6">
                                {story.description}
                              </p>
                            </div>
                            <div>
                              <div className="py-1 px-3 rounded-md w-fit text-sm mb-auto mt-2 ">
                                <Link
                                  href={`stories?q=${story.category.toLowerCase()}`}
                                >
                                  <a className="mt-12 font-bold opacity-75 hover:text-[#2B6777f2]">
                                    {story.category.toLowerCase()}
                                  </a>
                                </Link>
                              </div>
                              <div className="flex space-x-4 min-w-[90%] mx-auto shrink-0 mt-1">
                                <Link href={`/stories/${story.id}/overview`}>
                                  <a className="bg-[#2B6777f2] rounded-full min-w-[190px] flex justify-center items-center">
                                    <BookOpenIcon
                                      width="40"
                                      height="30"
                                      stroke="#c9c7a5"
                                    />
                                    <p className="font-bold text-slate-200">
                                      Read story
                                    </p>
                                  </a>
                                </Link>
                                <button
                                  aria-label="Delete story"
                                  onClick={() => deleteStoryHandler(story.id)}
                                  className="bg-red-400 px-2 py-1 rounded-full"
                                >
                                  <TrashIcon width="30" height="25" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          {props.tab === 'messages' && (
            <div>
              <h1>Hi</h1>
            </div>
          )}
          {props.tab === 'library' &&
            (favorites.length !== 0 ? (
              <section className="mt-[3em]">
                <div className="w-[95%] mx-auto h-full grid grid-cols-2 gap-4]">
                  {favorites.map((favorite) => {
                    return (
                      <div
                        key={`favorite-${favorite.storyId}`}
                        className="w-full shrink-0"
                      >
                        <div className="flex">
                          <div className="shrink-0">
                            <Image
                              src={favorite.coverImgUrl}
                              alt={`${favorite.title} book cover`}
                              width="200"
                              height="250"
                              className="rounded-lg"
                            />
                          </div>
                          <div className="py-4 px-4 flex flex-col justify-between break-all">
                            <div className="space-y-2">
                              <p className="text-[#2B6777f2] font-bold tracking-wide">
                                {favorite.title}
                              </p>
                              <p className="font-semibold text-sm line-clamp-6">
                                By:{' '}
                                <span className="text-[#2B6777f2]">
                                  <Link href={`/users/${favorite.author}`}>
                                    {favorite.author}
                                  </Link>
                                </span>
                              </p>
                              <p className="font-semibold text-sm line-clamp-6">
                                {favorite.description}
                              </p>
                            </div>
                            <div>
                              <div className="py-1 px-3 rounded-md w-fit text-sm mb-auto mt-2 ">
                                <Link
                                  href={`stories?q=${favorite.category.toLowerCase()}`}
                                >
                                  <a className="mt-12 font-bold opacity-75 hover:text-[#2B6777f2]">
                                    {favorite.category.toLowerCase()}
                                  </a>
                                </Link>
                              </div>
                              <div className="flex space-x-4 min-w-[90%] mx-auto shrink-0 mt-1">
                                <Link
                                  href={`/stories/${favorite.storyId}/overview`}
                                >
                                  <a className="bg-[#2B6777f2] rounded-full min-w-[190px] flex justify-center items-center">
                                    <BookOpenIcon
                                      width="40"
                                      height="30"
                                      stroke="#c9c7a5"
                                    />
                                    <p className="font-bold text-slate-200">
                                      Read story
                                    </p>
                                  </a>
                                </Link>
                                <button
                                  aria-label="Remove from favorites"
                                  onClick={() =>
                                    removeFromFavorites(
                                      favorite.storyId,
                                      props.userProfile.userId,
                                    )
                                  }
                                  className="bg-red-400 px-2 py-1 rounded-full"
                                >
                                  <TrashIcon width="30" height="25" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : (
              <section>
                <div className="flex justify-center items-center flex-col mt-20 space-y-6">
                  <p className="font-bold text-3xl tracking-wide text-[#2B6777f2]">
                    Oops. Library looks empty.
                  </p>
                  <Link href="/stories">
                    <a className="font-bold text-xl tracking-wide bg-[length:250px] bg-no-repeat bg-center rounded-full bg-ink text-slate-50 p-[2em] scale-100 duration-200 ease-in hover:bg-[length:260px] hover:scale-110 focus:bg-[length:260px] focus:scale-105">
                      Browse stories
                    </a>
                  </Link>
                </div>
              </section>
            ))}
        </div>
      </div>
    </main>
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
