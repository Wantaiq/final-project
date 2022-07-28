import {
  BookOpenIcon,
  CheckCircleIcon,
  PencilAltIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/outline';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useContext, useEffect, useState } from 'react';
import Pagination from '../../components/Pagination';
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

  const [currentPage, setCurrentPage] = useState(1);
  const storiesPerPage = 4;

  const indexOfPreviousStory = currentPage * storiesPerPage;
  const indexOfFirstStory = indexOfPreviousStory - storiesPerPage;
  const currentStories = userStories.slice(
    indexOfFirstStory,
    indexOfPreviousStory,
  );

  // Update header

  useEffect(() => {
    handleUserProfile();
  }, [handleUserProfile]);

  function paginate(pageNumber: number) {
    setCurrentPage(pageNumber);
  }

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
      <Head>
        <title>{props.userProfile.username}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="flex h-full items-start">
          <div className="flex flex-col items-center justify-start w-[30%] h-full">
            <div className="flex items-start justify-center space-x-2">
              <div className="flex flex-col items-center space-y-4">
                {typeof selectedAvatarImage === 'string' && (
                  <Image
                    src={
                      selectedAvatarImage
                        ? selectedAvatarImage
                        : props.userProfile.avatar
                    }
                    width={80}
                    height={80}
                    className="rounded-full"
                    alt="Profile picture"
                  />
                )}
                {isAvatarUpdate ? (
                  <form onSubmit={(e) => handleSubmitProfileImage(e)}>
                    <div className="flex flex-col items-center space-y-2">
                      <label
                        htmlFor="uploadAvatar"
                        className="py-[.2em] px-[.6em] w-fit mx-auto font-bold rounded-full bg-cyan-400 scale-100 duration-200 ease-in  hover:scale-105 hover:bg-cyan-800 hover:text-slate-200 focus:scale-105 focus:bg-cyan-800 focus:text-slate-200 cursor-pointer"
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
                      <div className="flex space-x-2">
                        <button
                          aria-label="Save changes"
                          disabled={imgAvatarUploadError ? true : false}
                          className="bg-cyan-600 py-[0.3em] rounded-full font-bold tracking-wider self-center px-[.4em] scale-100 duration-200 ease-in hover:scale-105 hover:bg-cyan-800 hover:text-slate-200 focus:scale-105 focus:bg-cyan-800 cursor-pointer"
                        >
                          <CheckCircleIcon width={20} height={20} />
                        </button>
                        <button
                          aria-label="Discard changes"
                          onClick={() => discardAvatarChanges()}
                          className="bg-red-300 py-[.3em] font-bold tracking-wider rounded-full px-[.4em] self-center fill-red-400 scale-100 duration-200 ease-in hover:scale-105 hover:bg-red-800 hover:text-slate-200 focus:scale-105 focus:bg-cyan-800 cursor-pointer"
                        >
                          <XCircleIcon width={20} height={20} />
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <button
                    className="bg-cyan-600 py-[0.2em] rounded-full font-bold tracking-wider self-center px-[.4em] scale-100 duration-200 ease-in hover:scale-105 hover:bg-cyan-800 hover:text-slate-200 focus:scale-105 focus:bg-cyan-800 cursor-pointer"
                    onClick={() => setIsAvatarUpdate(true)}
                  >
                    Upload image
                  </button>
                )}
              </div>
              {/* Profile details */}
              <div className="mt-6 flex flex-col space-y-2 items-center p-[1em] ">
                <p className="font-bold text-xl tracking-wider text-slate-200">
                  {props.userProfile.username}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="font-bold text-2xl text-cyan-400">
                    {numberOfStories}
                  </p>
                  <p className="text-slate-200">
                    {numberOfStories === 1 ? 'Story' : 'Stories'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex mt-4">
              {isUserBioUpdate ? (
                <form onSubmit={handleUserBioSubmit}>
                  <div className="flex flex-col items-center space-y-4 w-[60%] mt-3">
                    <label
                      htmlFor="userBio"
                      className="text-slate-200 font-semibold tracking-wide"
                    >
                      Update bio
                    </label>
                    <textarea
                      className="text-black indent-4 resize-none rounded-md w-[100%] px-2 h-[120px]"
                      id="userBio"
                      value={userBio ? userBio : ''}
                      onChange={(event) =>
                        setUserBio(event.currentTarget.value)
                      }
                      placeholder={userBio === null ? 'About you ...' : userBio}
                    />
                    <button className="py-[.3em] px-[.4em] w-fit mx-auto text-lg font-bold rounded-full bg-cyan-400 scale-100 duration-200 ease-in  hover:scale-105 hover:bg-cyan-800 hover:text-slate-200 focus:scale-105 focus:bg-cyan-800 focus:text-slate-200 cursor-pointer">
                      <CheckCircleIcon width={20} height={20} />
                    </button>
                    <p className="text-red-400 font-bold">
                      * This information will be visible to other users.
                    </p>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center px-12">
                  <p className="tracking-wide text-slate-300 font-bold">
                    {!userBio
                      ? `Mysterious person that loves to read and write stories.`
                      : userBio}
                  </p>
                  <button
                    aria-label="Edit bio"
                    onClick={() => setIsUserBioUpdate(true)}
                    className="scale-100 transition-all focus:scale-105 hover:scale-105 duration-200 ease-in-out"
                  >
                    <PencilAltIcon
                      width="25"
                      height="25"
                      stroke="rgb(34 211 238)"
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Tabs */}
          <div className="w-[95%]">
            <div className="flex pb-4 w-[80%] mx-auto justify-around mb-10">
              <Link href="/profile">
                <a
                  className={`font-bold text-lg pb-2 tracking-wide text-slate-50 scale-100 duration-200 ease-in hover:scale-105 focus:scale-105 ${
                    !props.tab && 'border-b-2 border-cyan-400'
                  }`}
                >
                  Your stories
                </a>
              </Link>
              <Link href="/profile?tab=favorites">
                <a
                  className={`font-bold text-lg pb-2 tracking-wide text-slate-50 scale-100 duration-200 ease-in  hover:scale-105 focus:scale-105 ${
                    props.tab === 'favorites' && 'border-b-2 border-cyan-400'
                  }`}
                >
                  Favorites
                </a>
              </Link>
              <Link href="/profile/create-story">
                <a className="font-bold text-lg tracking-wide bg-no-repeat rounded-full text-slate-50  scale-100 duration-200 ease-in  hover:scale-105 focus:scale-105">
                  Create new story
                </a>
              </Link>
            </div>
            {!props.tab &&
              (userStories.length === 0 ? (
                <div className="flex flex-col space-y-10 items-center mt-40">
                  <p
                    className="font-bold text-3xl tracking-wide text-slate-200 mb-22"
                    data-test-id="no-stories-banner"
                  >
                    You don't have any stories.
                  </p>
                  <Link href="/profile/create-story">
                    <a
                      className="bg-cyan-400 py-[0.5em] rounded-full font-bold tracking-wider self-center px-[1.4em] scale-100 duration-200 ease-in hover:scale-105 hover:bg-cyan-800 hover:text-slate-100 focus:scale-105 focus:bg-cyan-800 cursor-pointer"
                      data-test-id="storyCreation"
                    >
                      Create story
                    </a>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-[90%] mx-auto grid grid-cols-2 gap-x-5 gap-y-5 grid-rows-1">
                    {currentStories.map((story) => {
                      return (
                        <div
                          key={`storyId-${story.id}`}
                          className="group px-10   shadow-lg shadow-black pt-2"
                        >
                          <div className="flex align-center justify-center transition-all duration-500 ease-in-out group-hover:scale-105">
                            <div className="shrink-0">
                              <Image
                                src={story.coverImgUrl}
                                alt={`${story.title} book cover`}
                                width={150}
                                height={200}
                                className="rounded-lg"
                              />
                            </div>
                            <div className="flex py-4 px-4 flex-col justify-between break-all min-h-full">
                              <div className="space-y-2">
                                <p className="text-slate-200 border-b-2 pb-2 border-b-cyan-500 font-bold tracking-wide">
                                  {story.title}
                                </p>
                                <p className="font-semibold text-sm line-clamp-2 text-slate-200 pt-2 break-all px-2">
                                  {story.description}
                                </p>
                              </div>
                              <div>
                                <div className="py-2 px-3 rounded-md w-fit text-sm mb-auto">
                                  <Link
                                    href={`/stories?q=${story.category.toLowerCase()}`}
                                  >
                                    <a className="mt-12  bg-cyan-500/70 px-[0.5em] py-[.1em] rounded font-bold opacity-75 hover:text-slate-200">
                                      {story.category.toLowerCase()}
                                    </a>
                                  </Link>
                                </div>
                                <div className="flex space-x-2 min-w-[90%] mx-auto shrink-0 ">
                                  <Link href={`/stories/${story.id}`}>
                                    <a className="bg-cyan-800 rounded-full min-w-[190px] flex justify-center items-center scale-100 duration-200 ease-in  hover:scale-105 focus:scale-105 focus:bg-cyan-800 focus:text-slate-200 cursor-pointer">
                                      <BookOpenIcon
                                        width="40"
                                        height="30"
                                        stroke="#ffffff"
                                      />
                                      <p className="font-bold text-slate-200">
                                        Read story
                                      </p>
                                    </a>
                                  </Link>
                                  <button
                                    aria-label="Delete story"
                                    onClick={() => deleteStoryHandler(story.id)}
                                    className="bg-red-400 px-2 py-1 rounded-full hover:bg-red-600 focus:bg-red-600 scale-100 duration-200 ease-in  hover:scale-105 focus:scale-105 "
                                  >
                                    <TrashIcon width="20" height="20" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Pagination
                    storiesPerPage={storiesPerPage}
                    totalStories={numberOfStories}
                    paginate={paginate}
                  />
                </div>
              ))}
            {props.tab === 'favorites' &&
              (favorites.length !== 0 ? (
                <section>
                  <div className="w-[95%] mx-auto h-full grid grid-cols-2 gap-x-10 gap-y-20">
                    {favorites.map((favorite) => {
                      return (
                        <div
                          key={`storyId-${favorite.storyId}`}
                          className="group px-10 h-full shadow-lg shadow-black pt-2"
                        >
                          <div className="flex align-center justify-center transition-all duration-500 ease-in-out group-hover:scale-105 py-2">
                            <div className="shrink-0">
                              <Image
                                src={favorite.coverImgUrl}
                                alt={`${favorite.title} book cover`}
                                width={150}
                                height={200}
                                className="rounded-lg"
                              />
                            </div>
                            <div className="flex px-4 flex-col justify-between break-all min-h-full">
                              <div className="space-y-2">
                                <p className="text-slate-200 font-bold tracking-wide">
                                  {favorite.title}
                                </p>
                                <p className="font-semibold text-slate-200 mt-2 border-b-2 pb-3">
                                  By:
                                  <span className="text-cyan-400 font-semibold tracking-wider ml-2">
                                    <Link href={`/users/${favorite.author}`}>
                                      {favorite.author}
                                    </Link>
                                  </span>
                                </p>
                              </div>
                              <div className="h-[80px] pt-2">
                                <p className="font-semibold text-sm line-clamp-3 text-slate-200">
                                  {favorite.description}
                                </p>
                              </div>
                              <div className="px-3 rounded-md text-sm">
                                <Link
                                  href={`/stories?q=${favorite.category.toLowerCase()}`}
                                >
                                  <a className=" bg-cyan-200/70 px-[0.2em] py-[.06em] rounded font-bold opacity-75 hover:text-slate-200">
                                    {favorite.category.toLowerCase()}
                                  </a>
                                </Link>
                              </div>
                              <div className="flex space-x-4 min-w-[90%] mx-auto shrink-0 mt-1 mb-1">
                                <Link href={`/stories/${favorite.storyId}`}>
                                  <a className="bg-cyan-800 rounded-full min-w-[150px] flex justify-center items-center scale-100 duration-200 ease-in  hover:scale-105 focus:scale-105 focus:bg-cyan-800 focus:text-slate-200 cursor-pointer">
                                    <BookOpenIcon
                                      width="30"
                                      height="20"
                                      stroke="#ffffff"
                                    />
                                    <p className="font-bold text-slate-200">
                                      Read story
                                    </p>
                                  </a>
                                </Link>
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
                  <div className="flex flex-col space-y-10 items-center mt-40">
                    <p className="font-bold text-3xl tracking-wide text-slate-200 mb-22">
                      Oops. You don't have any favorites
                    </p>
                    <Link href="/stories">
                      <a className="bg-cyan-400 py-[0.5em] rounded-full font-bold tracking-wider self-center px-[1.4em] scale-100 duration-200 ease-in hover:scale-105 hover:bg-cyan-800 hover:text-slate-100 focus:scale-105 focus:bg-cyan-800 cursor-pointer">
                        Browse stories
                      </a>
                    </Link>
                  </div>
                </section>
              ))}
          </div>
        </div>
      </main>
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
