import { GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { profileContext } from '../context/ProfileProvider';
import { createCsrfToken } from '../util/auth';
import {
  FavoriteStories,
  getAllFavoriteStoriesByUserId,
  getAllUserStoriesByUserId,
  getCsrfSeedByValidUserToken,
  getUserProfileByValidSessionToken,
  UserProfile,
  UserStory,
} from '../util/database';

type Props = {
  userProfile: UserProfile;
  csrfToken: string;
  userStories: UserStory[];
  tab: string | undefined;
  favorites: FavoriteStories;
};

type StoryInput = {
  title: string;
  description: string;
  chapterContent: string;
  chapterHeading: string;
};

export default function Profile(props: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    resetField,
    setFocus,
  } = useForm<StoryInput>();
  const [chapterNumber, setChapterNumber] = useState(1);
  const [newStory, setNewStory] = useState<UserStory | undefined>(undefined);
  const [userStories, setUserStories] = useState(props.userStories);
  const [isStory, setIsStory] = useState(false);
  const [numberOfStories, setNumberOfStories] = useState(
    props.userStories.length,
  );
  const [coverStoryImg, setCoverStoryImg] = useState<any>('');
  const [coverStoryImgError, setCoverStoryImgError] = useState<
    undefined | string
  >(undefined);

  const [imgAvatarUploadError, setImgAvatarUploadError] = useState<
    string | undefined
  >(undefined);

  const [selectedAvatarImage, setSelectedAvatarImage] = useState<any>('');
  const [avatarImgInput, setAvatarImgInput] = useState('');
  const [isAvatarUpdate, setIsAvatarUpdate] = useState(false);
  const [isUserBioUpdate, setIsUserBioUpdate] = useState(false);
  const [userBio, setUserBio] = useState('');

  const { handleUserProfile } = useContext(profileContext);

  async function createNewStoryHandler(storyInput: StoryInput) {
    const isStoryInputValid = await trigger();
    if (isStoryInputValid) {
      setNumberOfStories((prevNumber) => prevNumber + 1);
      setIsStory(true);
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csrfToken: props.csrfToken,
          title: storyInput.title,
          description: storyInput.description,
          userId: props.userProfile.userId,
          coverImg: coverStoryImg,
        }),
      });
      const data: { newStory: UserStory } = await response.json();
      setNewStory(data.newStory);
      setUserStories((prevStories) => [data.newStory, ...prevStories]);
    }
  }
  async function createNewChapterHandler(userChapterInput: StoryInput) {
    const isStoryInputValid = await trigger();
    if (isStoryInputValid) {
      await fetch('/api/stories/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csrfToken: props.csrfToken,
          storyId: newStory?.id,
          heading: userChapterInput.chapterHeading,
          content: userChapterInput.chapterContent,
          sortPosition: chapterNumber,
        }),
      });
      resetField('chapterContent');
      resetField('chapterHeading');
      setFocus('chapterHeading');
      setChapterNumber((prevNumber) => prevNumber + 1);
    }
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

  function handleCoverStoryInput(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;
    if (event.target.files.length === 0) {
      setCoverStoryImg('');
      return;
    }
    const uploadedImg = event.target.files[0];
    const fileSize = Math.round(event.target.files[0].size / 1000);
    if (fileSize > 1000) {
      setCoverStoryImgError('Maximum image size is 1mb');
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(uploadedImg);
    reader.onloadend = () => {
      setCoverStoryImg(reader.result);
    };
    setCoverStoryImgError('');
    return;
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
      setImgAvatarUploadError('Maximum image size is 1mb');
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
    setUserBio('');
    setIsUserBioUpdate(false);
  }

  return (
    <>
      {/* Profile */}
      <div className="p-20 w-[65%] border-b-2 mx-auto flex justify-between">
        <div className="flex space-x-14">
          <div className="flex flex-col space-y-4">
            <div className="w-[320px] h-[320px] rounded-full border-2">
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
              <span className="font-bold text-3xl">{numberOfStories}</span>
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
              value={userBio}
              onChange={(event) => setUserBio(event.currentTarget.value)}
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
        ) : (
          <div>
            <h2 className="text-xl tracking-wide opacity-70">
              {!props.userProfile.bio
                ? `Mysterious person that loves to read and write stories`
                : props.userProfile.bio}
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
            props.tab === 'writing-table' && 'border-b-2 border-amber-600'
          }`}
        >
          <Link href="/profile?tab=writing-table">Writing table</Link>
        </div>
        <div
          className={`font-bold text-xl tracking-wide ${
            props.tab === 'favorites' && 'border-b-2 border-amber-600'
          }`}
        >
          <Link href="/profile?tab=favorites">Your favorites</Link>
        </div>
      </div>
      {!props.tab &&
        (props.userStories.length === 0 ? (
          <div className="mx-auto my-24 w-fit">
            <h1 className="font-bold text-3xl tracking-wide text-amber-600">
              You don't have any stories
            </h1>
          </div>
        ) : (
          <div className="w-[65%] mx-auto grid grid-cols-4 px-14 py-8 gap-7">
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
      {props.tab === 'writing-table' &&
        (!isStory ? (
          <div className="w-[65%] mx-auto px-20 py-8">
            <h1 className="font-bold text-2xl tracking-wide text-amber-400 mb-6">
              Create new story
            </h1>
            <form
              className="flex flex-col space-y-4"
              onSubmit={handleSubmit(createNewStoryHandler)}
            >
              <label htmlFor="title">Title</label>
              <input
                id="title"
                {...register('title', {
                  required: {
                    value: true,
                    message: 'Hmm, story without title?',
                  },
                })}
              />
              {errors.title ? (
                <p className="font-bold tracking-wide text-sm text-red-300">
                  {errors.title.message}
                </p>
              ) : null}
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                className="text-black indent-3"
                {...register('description', {
                  required: {
                    value: true,
                    message: 'Let others know what you story is about.',
                  },
                })}
              />
              {errors.description ? (
                <p className="font-bold tracking-wide text-sm text-red-300">
                  {errors.description.message}
                </p>
              ) : null}
              <label htmlFor="coverStory">Choose cover story</label>
              <input
                type="file"
                accept=".jpg , .png, .jpeg"
                disabled={coverStoryImg ? true : false}
                onChange={handleCoverStoryInput}
              />
              {coverStoryImg && (
                <div className="w-[400px] h-[400px] rounded-md">
                  <Image
                    src={coverStoryImg}
                    width={300}
                    height={300}
                    className="rounded-md"
                  />
                </div>
              )}
              <button
                className="bg-amber-600 py-[0.6em] px-[1.2em] rounded-md font-medium tracking-wider self-center"
                disabled={coverStoryImgError ? true : false}
              >
                Start new story!
              </button>
              {coverStoryImgError && <p>{coverStoryImgError}</p>}
            </form>
          </div>
        ) : (
          <div className="w-[65%] mx-auto px-20 py-8">
            <h1 className="font-bold text-2xl tracking-wide text-amber-400 mb-6">
              Write chapter # {chapterNumber}
            </h1>
            <form
              onSubmit={handleSubmit(createNewChapterHandler)}
              className="space-y-6"
            >
              <div className="flex flex-col space-y-6">
                <label htmlFor="chapterHeading">Chapter heading</label>
                <textarea
                  id="chapterHeading"
                  className="text-black indent-3"
                  {...register('chapterHeading', {
                    required: { value: true, message: 'Write short title.' },
                  })}
                />
              </div>
              <div className="flex flex-col space-y-6">
                <label htmlFor="chapterContent">Chapter:</label>
                <textarea
                  id="chapterContent"
                  className="text-black indent-3 h-[500px]"
                  {...register('chapterContent')}
                />
              </div>
              <div className="px-12 space-x-12">
                <button className="bg-amber-600 py-[0.4em] rounded font-medium tracking-wider self-center px-[1.2em]">
                  Next chapter
                </button>
                <Link href={`/stories/${newStory?.id}/overview`}>
                  <button className="bg-amber-600 py-[0.4em] rounded font-medium tracking-wider self-center px-[1.2em]">
                    Publish!
                  </button>
                </Link>
              </div>
            </form>
          </div>
        ))}
      {props.tab === 'favorites' && (
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
