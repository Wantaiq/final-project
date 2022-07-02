import { GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createCsrfToken } from '../../util/auth';
import {
  getAllUsersCommentsByUserId,
  getAllUserStoriesByUserId,
  getCsrfSeedByValidUserToken,
  getUserProfileByValidSessionToken,
  UserComments,
  UserProfile,
  UserStory,
} from '../../util/database';

type Props = {
  userProfile: UserProfile;
  csrfToken: string;
  userStories: UserStory[];
  tab: string | undefined;
  userComments: UserComments;
};

type StoryInput = {
  title: string;
  description: string;
  chapterContent: string;
  chapterHeading: string;
};

function UpdateProfileBio(props) {
  return (
    <form onSubmit={(e) => props.handleUserBioSubmit(e)}>
      <label htmlFor="userBio">Update your bio</label>
      <textarea
        className="text-black indent-4"
        id="userBio"
        value={props.userBio}
        onChange={(e) => props.handleUserBioInput(e)}
        placeholder={
          props.userProfileBio === null ? 'About you ...' : props.userProfileBio
        }
      />
      <p>* This information will be visible to other users.</p>
      <button className="font-bold text-2xl tracking-wide mb-6 bg-amber-700 px-[1em] py-[.2em] cursor-pointer">
        Save and exit
      </button>
    </form>
  );
}

function UpdateProfileImage(props) {
  return (
    <form onSubmit={(e) => props.handleSubmitProfileImage(e)}>
      <label
        htmlFor="uploadAvatar"
        className="font-bold text-2xl tracking-wide mb-6 bg-amber-700 px-[1em] py-[.2em] cursor-pointer"
      >
        Select image
      </label>
      <p>{props.imgUploadError}</p>
      <input
        id="uploadAvatar"
        type="file"
        accept=".jpg, .png, .jpeg"
        hidden
        value={props.avatarImgInput}
        onChange={(event) => props.handleAvatarInput(event)}
      />
      <button disabled={props.imgUploadError}>Save and exit</button>
    </form>
  );
}
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

  const [imgUploadError, setImgUploadError] = useState('');
  const [selectedImg, setSelectedImg] = useState<any>('');
  const [avatarImgInput, setAvatarImgInput] = useState('');
  const [isAvatarUpdate, setIsAvatarUpdate] = useState(false);
  const [isUserBioUpdate, setIsUserBioUpdate] = useState(false);
  const [userBio, setUserBio] = useState('');

  async function createNewStoryHandler(storyInput: StoryInput) {
    const isStoryInputValid = await trigger();
    if (isStoryInputValid) {
      const response = await fetch('http://localhost:3000/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csrfToken: props.csrfToken,
          title: storyInput.title,
          description: storyInput.description,
          userId: props.userProfile.userId,
        }),
      });
      const data: { newStory: UserStory } = await response.json();
      setNewStory(data.newStory);
      setUserStories((prevStories) => [data.newStory, ...prevStories]);
      setNumberOfStories((prevNumber) => prevNumber + 1);
      setIsStory(true);
    }
  }
  async function createNewChapterHandler(userChapterInput: StoryInput) {
    const isStoryInputValid = await trigger();
    if (isStoryInputValid) {
      await fetch('http://localhost:3000/api/stories/chapters', {
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
    const response = await fetch('http://localhost:3000/api/stories', {
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

  async function handleProfileUpload(imgEncoded: string) {
    if (!imgEncoded) {
      setIsAvatarUpdate(false);
      return;
    }
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          img: imgEncoded,
          csrfToken: props.csrfToken,
        }),
      });
      if (!response.ok) {
        throw new Error('Maximum image size is 1mb');
      }
      setIsAvatarUpdate(false);
    } catch (error) {
      setImgUploadError(error.message);
    }
  }
  async function handleSubmitProfileImage(event: FormEvent) {
    event.preventDefault();
    await handleProfileUpload(selectedImg);
  }
  function previewImg(img: Blob) {
    if (typeof img === 'undefined') return;
    const reader = new FileReader();
    reader.readAsDataURL(img);
    reader.onloadend = () => {
      setSelectedImg(reader.result);
    };
  }

  function handleAvatarInput(event) {
    const uploadedImg = event.target.files[0];
    const fileSize = Math.round(event.target.files[0].size / 1000);
    if (fileSize > 1000) {
      setImgUploadError('Maximum image size is 1mb');
      return;
    }
    previewImg(uploadedImg);
    setAvatarImgInput(event.currentTarget.value);
  }

  async function handleUserBioSubmit() {
    if (!userBio) {
      setIsUserBioUpdate(false);
      return;
    }
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userBio, csrfToken: props.csrfToken }),
    });
    const data = await response.json();
    setUserBio('');
    setIsUserBioUpdate(false);
  }

  function handleUserBioInput(event) {
    setUserBio(event.currentTarget.value);
  }
  return (
    <>
      {/* Profile */}
      <div className="p-20 w-[65%] border-b-2 mx-auto flex justify-between">
        <div className="flex space-x-14">
          <div className="flex flex-col space-y-4">
            <div className="w-[320px] h-[320px] rounded-full border-2">
              <Image
                src={selectedImg ? selectedImg : props.userProfile.avatar}
                width={320}
                height={320}
                className="rounded-full"
                alt="Profile picture"
              />
            </div>
            {isAvatarUpdate ? (
              <UpdateProfileImage
                imgUploadError={imgUploadError}
                avatarImgInput={avatarImgInput}
                handleAvatarInput={handleAvatarInput}
                handleSubmitProfileImage={handleSubmitProfileImage}
              />
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
            <p className="">
              <span className="font-bold text-3xl">{numberOfStories}</span>{' '}
              {numberOfStories === 1 ? 'Story' : 'Stories'}
            </p>
          </div>
        </div>
        {isUserBioUpdate ? (
          <UpdateProfileBio
            handleUserBioSubmit={handleUserBioSubmit}
            userProfileBio={props.userProfile.bio}
            handleUserBioInput={handleUserBioInput}
            userBio={userBio}
          />
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
            props.tab === 'comments' && 'border-b-2 border-amber-600'
          }`}
        >
          <Link href="/profile?tab=comments">Comments</Link>
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
                  className="border-2 px-6 pt-12 pb-6 rounded-lg w-[90%]"
                >
                  <h1 className="font-bold text-lg tracking-wide text-amber-400 mb-4 border-b-2 pb-4">
                    {story.title}
                  </h1>
                  <h2 className="font-medium tracking-wide">
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
              <button className="bg-amber-600 py-[0.6em] px-[1.2em] rounded-md font-medium tracking-wider self-center">
                Start new story!
              </button>
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
      {props.tab === 'comments' && (
        <div>
          {props.userComments.map((comment) => {
            return (
              <div
                key={`commentId-${comment.id}`}
                className="w-[65%] mx-auto px-20 py-10 border-b-2 mt-6 flex justify-evenly items-center"
              >
                <Link href={`/stories/${comment.storyId}/overview`}>
                  <a>Story : {comment.storyTitle}</a>
                </Link>
                <p> You wrote : {comment.content}</p>
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
    const userComments = await getAllUsersCommentsByUserId(userProfile.userId);
    const csrfToken = createCsrfToken(csrfSeed);
    return {
      props: {
        userProfile,
        csrfToken,
        userStories,
        tab,
        userComments,
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
