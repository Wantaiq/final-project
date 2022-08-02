import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  TrashIcon,
} from '@heroicons/react/outline';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { profileContext } from '../../../context/ProfileProvider';
import { createCsrfToken } from '../../../util/auth';
import {
  Chapters,
  Comments,
  getAllStoryChaptersByStoryId,
  getAllStoryChapterTitlesByStoryId,
  getAllStoryCommentsByStoryId,
  getCsrfSeedByValidUserToken,
  getCurrentUserIdBySessionToken,
  getStoryOverviewByStoryId,
  isStoryFavorite,
  StoryOverview,
} from '../../../util/database';

type Props = {
  overview?: StoryOverview;
  userId?: { id: number };
  csrfToken?: string;
  comments: Comments;
  isFavorite?: boolean;
  chapterTitles: { heading: string; chapterNumber: number }[];
  chapters: Chapters[];
};

type Comment = {
  comment: string;
};
export default function Overview(props: Props) {
  const { userProfile } = useContext(profileContext);
  console.log(props);
  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm<Comment>();
  const [storyComments, setStoryComments] = useState(props.comments);
  const [isFavorite, setIsFavorite] = useState(props.isFavorite);
  const [currentChapter, setCurrentChapter] = useState(0);

  function nextChapter() {
    setCurrentChapter((prevChapter) =>
      prevChapter === props.chapters.length - 1 ? 0 : prevChapter + 1,
    );
  }

  function previousChapter() {
    setCurrentChapter((prevChapter) =>
      prevChapter === 0 ? props.chapters.length - 1 : prevChapter - 1,
    );
  }
  async function createNewCommentHandler(commentInput: Comment) {
    if (props.userId && props.overview) {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csrfToken: props.csrfToken,
          userId: props.userId.id,
          storyId: props.overview.storyId,
          content: commentInput.comment,
        }),
      });
      const data = await response.json();
      setStoryComments((prevComments) => [
        {
          ...data.newComment,
          username: userProfile?.username,
          profileAvatarUrl: userProfile?.avatar,
        },
        ...prevComments,
      ]);
    }
    resetField('comment');
  }
  async function removeCommentHandler(commentId: number) {
    const response = await fetch('/api/comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId, csrfToken: props.csrfToken }),
    });
    const data = await response.json();
    setStoryComments((prevComments) =>
      prevComments.filter((comment) => comment.id !== data.deletedComment.id),
    );
  }

  async function addToFavorites(storyId: number, userId: number) {
    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId, userId, csrfToken: props.csrfToken }),
    });
    setIsFavorite(true);
  }

  async function removeFromFavorites(storyId: number, userId: number) {
    await fetch('/api/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storyId, userId, csrfToken: props.csrfToken }),
    });
    setIsFavorite(false);
  }

  if (!props.overview) {
    return <h1>This story doesn't have any pages</h1>;
  }
  return (
    <>
      <Head>
        <title>{props.overview.title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="w-[90%] mx-auto mt-4 md:mt-14">
        <div className="md:flex md:space-x-20 md:mx-auto">
          <div>
            <div className="flex flex-col items-center space-y-4 border-b-2 border-cyan-400 pb-4 mx-auto">
              <div className="space-y-2 flex flex-col items-center">
                <p className="text-cyan-400 font-bold">
                  {props.overview.title}
                </p>
                <p className="tracking-wide text-md text-cyan-200 font-semibold text-base">
                  Description
                </p>
                <p className="break-words line-clamp-4">
                  {props.overview.description}
                </p>
                <div className="flex justify-around w-[250px]">
                  <div className="flex flex-col items-center">
                    <p className="pb-2">
                      By:{' '}
                      <span className="text-cyan-400 font-semibold hover:text-cyan-200 focus:text-cyan-200">
                        <Link href={`/users/${props.overview.author}`}>
                          {props.overview.author}
                        </Link>
                      </span>
                    </p>
                    <Image
                      src={props.overview.avatar}
                      width={35}
                      height={35}
                      className="rounded-full"
                    />
                  </div>
                  {props.userId &&
                    (!isFavorite ? (
                      <button
                        onClick={async () => {
                          await addToFavorites(
                            (props.overview as StoryOverview).storyId,
                            (props.userId as { id: number }).id,
                          );
                        }}
                      >
                        <HeartIcon width={30} height={30} />
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          await removeFromFavorites(
                            (props.overview as StoryOverview).storyId,
                            (props.userId as { id: number }).id,
                          );
                        }}
                      >
                        <HeartIcon
                          width={30}
                          height={30}
                          fill="rgb(252 165 165)"
                        />
                      </button>
                    ))}
                </div>
              </div>
            </div>
            <div>
              <p className="text-cyan-300 font-bold tracking-wide text-center mt-4">
                Table of contents
              </p>
              {props.chapterTitles.map((title) => {
                return (
                  <div
                    key={`title${title.heading}`}
                    className={`w-fit text-center my-2 border-b-2 pb-2.5  hover:border-cyan-200 mx-auto text-sm ${
                      currentChapter === title.chapterNumber - 1
                        ? 'border-cyan-200'
                        : 'border-slate-200/500'
                    }`}
                  >
                    <button
                      className="font-semibold tracking-wider"
                      onClick={() => setCurrentChapter(title.chapterNumber - 1)}
                    >
                      <p className="break-all line-clamp-3">
                        #{title.chapterNumber} {title.heading}
                      </p>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col space-y-2 md:w-[50%]">
            <div className="bg-[#fdf5e8] rounded-lg overflow-y-scroll max-h-[550px] min-h-[550px] scrollbar break-words my-4 md:mx-auto md:w-full">
              {props.chapters.map((chapter, index) => {
                return (
                  <div
                    key={`chapterTitle-${chapter.id}`}
                    className={`py-12 flex flex-col text-slate-800  ${
                      index === currentChapter ? 'block' : 'hidden'
                    } `}
                  >
                    <div className="indent-4 px-4 md:px-10 leading-9">
                      <p className="font-bold text-lg tracking-wide text-center mb-4 border-b-2 pb-4 border-black/50">
                        #{chapter.chapterNumber} {chapter.heading}
                      </p>
                      <p className="font-semibold text-sm">{chapter.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center md:space-x-20 space-x-10">
              {currentChapter > 0 ? (
                <button
                  className="bg-cyan-400 py-[0.4em] text-slate-800 rounded-full font-bold tracking-wider self-center px-[.8em] scale-100
              transition-all duration-200 ease-in-out hover:scale-105 hover:bg-cyan-800 hover:text-slate-100 focus:scale-105 focus:bg-cyan-800 cursor-pointer"
                  onClick={() => previousChapter()}
                >
                  <div className="flex justify-center items-center">
                    <ChevronLeftIcon
                      width={20}
                      height={20}
                      className="mr-[.5em]"
                    />
                    Previous
                  </div>
                </button>
              ) : null}
              {currentChapter === props.chapters.length - 1 ? null : (
                <button
                  onClick={() => nextChapter()}
                  className="bg-cyan-400 py-[0.4em] text-slate-800 rounded-full font-bold tracking-wider self-center px-[.8em] scale-100 transition-all duration-200 ease-in-out hover:scale-105 hover:bg-cyan-800 hover:text-slate-100 focus:scale-105 focus:bg-cyan-800 cursor-pointer"
                >
                  <div className="flex justify-center items-center">
                    Next
                    <ChevronRightIcon
                      width={20}
                      height={20}
                      className="ml-[.5em]"
                    />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
        {!props.userId ? null : (
          <form
            onSubmit={handleSubmit(createNewCommentHandler)}
            className="mt-6 flex flex-col space-y-2 items-center mb-6"
          >
            <div>
              <label htmlFor="comment">
                <textarea
                  placeholder="Write a comment..."
                  className="text-black rounded-lg px-4 w-[250px] resize-none py-4"
                  {...register('comment', {
                    required: {
                      value: true,
                      message: 'Write short comment.',
                    },
                  })}
                />
              </label>
            </div>
            {errors.comment ? (
              <p className="font-bold tracking-wide text-sm text-red-300">
                {errors.comment.message}
              </p>
            ) : null}
            <button className="bg-cyan-400 text-slate-800 mb-2 py-[0.3em] rounded-full font-bold tracking-wider self-center px-[1.4em] scale-100 duration-200 ease-in hover:scale-110 hover:bg-cyan-800 hover:text-slate-100 focus:scale-105 focus:bg-cyan-800 cursor-pointer">
              Submit
            </button>
          </form>
        )}
        <div className="w-full md:w-[50%] mx-auto px-4 pb-4 ">
          {storyComments.length === 0
            ? null
            : storyComments.map((comment) => {
                return (
                  <div
                    key={`commentId-${comment.id}`}
                    className=" px-10 pt-2 mb-2 border-b-2 border-cyan-600"
                  >
                    <div className="flex">
                      <div className="flex items-center space-x-2 pl-4 w-full ">
                        <Image
                          width={25}
                          height={25}
                          src={comment.profileAvatarUrl}
                          className="rounded-full"
                        />
                        <Link href={`/users/${comment.username}`}>
                          <a className="text-slate-200 font-semibold hover:text-cyan-400 focus:text-cyan-400">
                            {comment.username}
                          </a>
                        </Link>
                      </div>
                      {userProfile?.username === comment.username && (
                        <button
                          onClick={() => removeCommentHandler(comment.id)}
                          className="bg-red-400 px-[.4em] py-[.2em] rounded-full hover:bg-red-600 focus:bg-red-600 scale-100 duration-200 ease-in  hover:scale-105 focus:scale-105 self-start"
                        >
                          <TrashIcon width="15" height="15" />
                        </button>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-slate-200">{comment.content}</p>
                    </div>
                  </div>
                );
              })}
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  if (typeof context.query.storyId !== 'string') return;
  const overview = await getStoryOverviewByStoryId(
    Number(context.query.storyId),
  );
  const userId = await getCurrentUserIdBySessionToken(
    context.req.cookies.sessionToken,
  );

  const comments = await getAllStoryCommentsByStoryId(
    Number(context.query.storyId),
  );
  const chapterTitles = await getAllStoryChapterTitlesByStoryId(
    Number(context.query.storyId),
  );
  const chapters = await getAllStoryChaptersByStoryId(
    Number(context.query.storyId),
  );

  if (!overview) {
    return { props: { overview: null } };
  }
  if (!userId) {
    return {
      props: { overview, comments, chapterTitles, chapters },
    };
  }
  const { csrfSeed } = await getCsrfSeedByValidUserToken(
    context.req.cookies.sessionToken,
  );
  const csrfToken = createCsrfToken(csrfSeed);
  const isFavorite = await isStoryFavorite(
    Number(context.query.storyId),
    userId.id,
  );
  return {
    props: {
      overview,
      userId,
      csrfToken,
      comments,
      isFavorite,
      chapterTitles,
      chapters,
    },
  };
}
