import { GetServerSidePropsContext } from 'next';
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
  return !isStory ? (
    <div>
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
              message: 'Let others know what your story is about.',
            },
          })}
        />
        {errors.description ? (
          <p className="font-bold tracking-wide text-sm text-red-300">
            {errors.description.message}
          </p>
        ) : null}
        <label htmlFor="category">Category</label>
        <select id="category" {...register('category')}>
          <option value="random">Random</option>
          <option value="adventure">Adventure</option>
          <option value="shortStory">Short story</option>
          <option value="humor">Humor</option>
          <option value="mystery">Mystery</option>
          <option value="fantasy">fantasy</option>
        </select>
        <label htmlFor="coverStory">Choose story cover</label>
        <input
          type="file"
          accept=".jpg , .png, .jpeg"
          disabled={coverStoryImg ? true : false}
          onChange={handleCoverStoryInput}
        />
        {coverStoryImg && (
          <div className="w-[400px] h-[400px] rounded-md">
            {typeof coverStoryImg === 'string' && (
              <Image
                src={coverStoryImg}
                width={300}
                height={300}
                className="rounded-md"
              />
            )}
          </div>
        )}
        <button
          className="bg-amber-600 py-[0.6em] px-[1.2em] rounded-md font-medium tracking-wider self-center"
          disabled={coverStoryImgError ? true : false}
        >
          Start new story!
        </button>
        {coverStoryImgError ? (
          <p className="font-bold tracking-wide text-sm text-red-300">
            {coverStoryImgError}
          </p>
        ) : null}
      </form>
    </div>
  ) : (
    <>
      <h1 className="font-bold text-2xl tracking-wide text-amber-400 mb-6">
        Chapter # {chapterNumber}
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
          {errors.chapterHeading ? (
            <p className="font-bold tracking-wide text-sm text-red-300">
              {errors.chapterHeading.message}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col space-y-6">
          <label htmlFor="chapterContent">Chapter:</label>
          <textarea
            id="chapterContent"
            className="text-black indent-3 h-[500px]"
            {...register('chapterContent', {
              required: {
                value: true,
                message: 'Write some content.',
              },
            })}
          />
          {errors.chapterContent ? (
            <p className="font-bold tracking-wide text-sm text-red-300">
              {errors.chapterContent.message}
            </p>
          ) : null}
        </div>
        <div className="px-12 space-x-12">
          <button className="bg-amber-600 py-[0.4em] rounded font-medium tracking-wider self-center px-[1.2em]">
            Next chapter
          </button>
          <Link href={`/stories/${newStory?.id}/overview`}>
            <button
              className={`bg-amber-600 py-[0.4em] rounded font-medium tracking-wider self-center px-[1.2em] ${
                chapterNumber > 1 ? 'inline' : 'hidden'
              }`}
            >
              Publish!
            </button>
          </Link>
        </div>
      </form>
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
