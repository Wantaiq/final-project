import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createCsrfToken } from '../../util/auth';
import {
  getCsrfSeedByValidUserToken,
  getUserProfileByValidSessionToken,
  UserProfile,
  UserStory,
} from '../../util/database';

type StoryInput = {
  title: string;
  description: string;
  chapterContent: string;
  category: string;
  chapterHeading: string;
};

type Props = {
  userProfile: UserProfile;
  csrfToken: string;
};
export default function CreateStory(props: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    resetField,
    setFocus,
  } = useForm<StoryInput>();
  const [newStory, setNewStory] = useState<UserStory | undefined>(undefined);
  const [chapterNumber, setChapterNumber] = useState(1);
  const [isStory, setIsStory] = useState(false);
  const [coverStoryImg, setCoverStoryImg] = useState<
    string | ArrayBuffer | null
  >('');
  const [coverStoryImgError, setCoverStoryImgError] = useState<
    undefined | string
  >(undefined);

  async function createNewStoryHandler(storyInput: StoryInput) {
    if (!coverStoryImg) {
      setCoverStoryImgError('Please choose cover image');
      return;
    }
    const isStoryInputValid = await trigger();
    if (isStoryInputValid) {
      setIsStory(true);
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csrfToken: props.csrfToken,
          title: storyInput.title,
          description: storyInput.description,
          userId: props.userProfile.userId,
          category: storyInput.category,
          coverImg: coverStoryImg,
        }),
      });
      const data: { newStory: UserStory } = await response.json();
      setNewStory(data.newStory);
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

  function handleCoverStoryInput(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) {
      return;
    }
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

  return (
    <>
      <Head>
        <title>New story</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!isStory ? (
        <main>
          <div className="md:w-[40%] px-4 md:px-0 mx-auto pb-6">
            <form
              className="flex flex-col space-y-4"
              onSubmit={handleSubmit(createNewStoryHandler)}
            >
              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="title"
                  className="text-cyan-400 font-semibold tracking-wider indent-5 text-lg"
                >
                  Title
                </label>
                <input
                  id="title"
                  {...register('title', {
                    required: {
                      value: true,
                      message: 'Hmm, story without title?',
                    },
                    minLength: {
                      value: 3,
                      message: 'Minimum length is 3 characters',
                    },
                  })}
                  data-test-id="story-title"
                />
                {errors.title ? (
                  <p
                    className="font-bold tracking-wide text-sm text-red-500 text-center"
                    data-test-id="story-title-error"
                  >
                    {errors.title.message}
                  </p>
                ) : null}
                <label
                  htmlFor="description"
                  className="indent-5 text-cyan-400 font-semibold tracking-wide text-lg"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  className="text-black indent-4 resize-none rounded-md h-[80px] px-4"
                  {...register('description', {
                    required: {
                      value: true,
                      message: 'Let others know what your story is about.',
                    },
                    minLength: {
                      value: 20,
                      message: 'Minimum length is 20 characters',
                    },
                  })}
                  data-test-id="story-description"
                />
                {errors.description ? (
                  <p
                    className="font-bold tracking-wide text-sm text-red-500 text-center"
                    data-test-id="story-description-error"
                  >
                    {errors.description.message}
                  </p>
                ) : null}
              </div>
              <div className="px-10 py-8 flex justify-around items-start">
                <div className="flex flex-col space-y-2 mr-6">
                  <label
                    htmlFor="category"
                    className="text-cyan-400 font-semibold tracking-wide text-lg"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    {...register('category')}
                    className="rounded-md text-gray-800"
                  >
                    <option value="other">Other</option>
                    <option value="adventure">Adventure</option>
                    <option value="short">Short</option>
                    <option value="humor">Humor</option>
                    <option value="mystery">Mystery</option>
                    <option value="fantasy">Fantasy</option>
                  </select>
                </div>
                {!coverStoryImg && (
                  <>
                    <label
                      htmlFor="storyCover"
                      className="font-lg font-bold px-[.5em] py-[.5em] mt-7
                      rounded-full bg-cyan-800 scale-100 duration-200 ease-in hover:scale-105 hover:bg-cyan-300
                      hover:text-slate-800
                      focus:text-slate-800 focus:scale-105 focus:cyan-300 focus:text-inherit cursor-pointer
                      active:text-slate-800"
                    >
                      Choose cover
                    </label>
                    <input
                      type="file"
                      id="storyCover"
                      hidden
                      accept=".jpg , .png, .jpeg"
                      disabled={coverStoryImg ? true : false}
                      onChange={handleCoverStoryInput}
                    />
                  </>
                )}
                {coverStoryImg && (
                  <div className="rounded-md ">
                    {typeof coverStoryImg === 'string' && (
                      <Image
                        src={coverStoryImg}
                        width={150}
                        height={200}
                        className="rounded-md"
                      />
                    )}
                  </div>
                )}
              </div>
              <button
                className="py-[.4em] px-[.8em] w-fit mx-auto text-lg font-bold text-gray-900 rounded-full bg-cyan-400 scale-100 duration-200 ease-in  hover:scale-110 hover:bg-cyan-800 hover:text-slate-200 focus:scale-105 focus:bg-cyan-800 focus:text-slate-200 cursor-pointer"
                disabled={coverStoryImgError ? true : false}
                data-test-id="start-story-button"
              >
                Start new story
              </button>
              {coverStoryImgError ? (
                <p
                  className="font-bold tracking-wide text-base text-red-300 text-center"
                  data-test-id="coverImgError"
                >
                  {coverStoryImgError}
                </p>
              ) : null}
            </form>
          </div>
        </main>
      ) : (
        <main className="mx-auto w-[80%] md:w-[50%] pb-4">
          <h1 className="font-bold text-2xl tracking-wide text-slate-200">
            Chapter #{chapterNumber}
          </h1>
          <form
            onSubmit={handleSubmit(createNewChapterHandler)}
            className="space-y-4"
          >
            <div className="flex flex-col justify-center w-full mt-10 items-center space-y-3">
              <label htmlFor="chapterHeading">
                <textarea
                  id="chapterHeading"
                  placeholder="Title"
                  className="text-black text-lg font-medium resize-none rounded-lg text-center"
                  {...register('chapterHeading', {
                    required: { value: true, message: 'Write short title' },
                    minLength: {
                      value: 3,
                      message: 'Minimum length is 3 characters',
                    },
                  })}
                />
              </label>
              {errors.chapterHeading ? (
                <p className="font-bold tracking-wide text-base text-red-300">
                  {errors.chapterHeading.message}
                </p>
              ) : null}
              <div className="flex flex-col space-y-6 w-full">
                <label htmlFor="chapterContent">
                  <textarea
                    id="chapterContent"
                    className="text-black indent-2 h-[300px] w-full resize-none md:px-24 px-2 font-medium leading-7 tracking-wide scrollbar"
                    {...register('chapterContent', {
                      required: {
                        value: true,
                        message: 'Write some content',
                      },
                      minLength: {
                        value: 20,
                        message: 'Minimum length is 20 characters',
                      },
                    })}
                  />
                </label>
                {errors.chapterContent ? (
                  <p className="font-bold text-base tracking-wide text-red-300 text-center">
                    {errors.chapterContent.message}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex md:flex-row md:justify-around flex-col items-center space-y-4 ">
              <button
                className="bg-cyan-700 py-[0.4em] text-slate-200 font-bold rounded-full tracking-wider self-center scale-100 duration-200 ease-in hover:scale-110  hover:bg-cyan-300 focus:scale-105 focus:bg-cyan-300
              hover:text-slate-800 focus:text-slate-800 cursor-pointer px-[1.2em] active:text-slate-800"
              >
                Next chapter
              </button>
              <Link href={`/stories/${newStory?.id}`}>
                <button
                  className={`bg-cyan-400 py-[0.5em] rounded-full font-bold
                  text-slate-800 tracking-wider self-center px-[1.4em] scale-100 duration-200 ease-in hover:bg- hover:scale-110 hover:bg-cyan-800 hover:text-slate-200 focus:text-slate-200
                   focus:scale-105 focus:bg-cyan-800 cursor-pointer ${
                     chapterNumber > 1 ? 'inline' : 'hidden'
                   }`}
                >
                  Publish
                </button>
              </Link>
            </div>
          </form>
        </main>
      )}
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userProfile = await getUserProfileByValidSessionToken(
    context.req.cookies.sessionToken,
  );
  if (userProfile) {
    const { csrfSeed } = await getCsrfSeedByValidUserToken(
      context.req.cookies.sessionToken,
    );
    const csrfToken = createCsrfToken(csrfSeed);
    return {
      props: {
        userProfile,
        csrfToken,
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
