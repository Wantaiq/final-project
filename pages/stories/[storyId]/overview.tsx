import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { profileContext } from '../../../context/ProfileProvider';
import { createCsrfToken } from '../../../util/auth';
import {
  Comments,
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
};

type Comment = {
  comment: string;
};
export default function Overview(props: Props) {
  const { userProfile } = useContext(profileContext);
  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm<Comment>();
  const [isComment, setIsComment] = useState(false);
  const [storyComments, setStoryComments] = useState(props.comments);
  const [isFavorite, setIsFavorite] = useState(props.isFavorite);
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
        { ...data.newComment, username: userProfile?.username },
        ...prevComments,
      ]);
    }
    setIsComment(false);
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
      <div
        style={{ backgroundImage: `url(${props.overview.coverImgUrl})` }}
        className="h-[350px] bg-no-repeat bg-cover"
      />
      <div className="w-[75%] mx-auto mt-24">
        <div>
          <h1 className="font-bold text-lg mb-2 pb-2 text-amber-500">
            Title: {props.overview.title}
          </h1>
          {props.userId &&
            (!isFavorite ? (
              <button
                className="bg-red-300"
                onClick={async () => {
                  await addToFavorites(
                    (props.overview as StoryOverview).storyId,
                    (props.userId as { id: number }).id,
                  );
                }}
              >
                Add to favorites
              </button>
            ) : (
              <button
                className="bg-red-500"
                onClick={async () => {
                  await removeFromFavorites(
                    (props.overview as StoryOverview).storyId,
                    (props.userId as { id: number }).id,
                  );
                }}
              >
                Remove from favorites
              </button>
            ))}
          <h2 className="tracking-wide text-md mb-2">
            Description : {props.overview.description}
          </h2>
          <p>Number of chapters: {props.overview.numberOfChapters}</p>
          <p className="opacity-80 mb-4">Author: {props.overview.author}</p>
          <div className="border-b-2 px-[2em] border-amber-500 mb-6 bg-amber-500 w-fit py-[.5em] rounded">
            <Link href={`/stories/${props.overview.storyId}`}>Read story</Link>
          </div>
        </div>
        <div>
          {storyComments.length === 0 ? (
            <h1>Be the first one to comment!</h1>
          ) : (
            storyComments.map((comment) => {
              return (
                <div key={`commentId-${comment.id}`} className="border-2 mb-">
                  <h1>{comment.username}</h1>
                  <h2>{comment.content}</h2>
                  {userProfile?.username === comment.username && (
                    <button
                      onClick={() => removeCommentHandler(comment.id)}
                      className="mt-6 bg-red-500 px-3 py-1 rounded-full font-bold"
                    >
                      Remove comment
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
        {isComment ? (
          <div>
            <form
              className="flex flex-col justify-center space-y-4"
              onSubmit={handleSubmit(createNewCommentHandler)}
            >
              <label htmlFor="comment">
                Let {props.overview.author} know what you think!
              </label>
              <textarea
                id="comment"
                placeholder="Write a comment..."
                className="text-black indent-3"
                {...register('comment', {
                  required: { value: true, message: 'Write short comment.' },
                })}
              />
              {errors.comment ? (
                <p className="font-bold tracking-wide text-sm text-red-300">
                  {errors.comment.message}
                </p>
              ) : null}
              <button className="bg-amber-600 py-[0.4em] rounded font-medium tracking-wider self-center px-[1.2em]">
                Submit
              </button>
              <button
                onClick={() => setIsComment(false)}
                className="bg-amber-600 py-[0.4em] rounded font-medium tracking-wider self-center px-[1.2em]"
              >
                Exit
              </button>
            </form>
          </div>
        ) : (
          <button
            onClick={() => setIsComment(true)}
            className="bg-amber-600 py-[0.4em] rounded font-medium tracking-wider self-center px-[1.2em]"
            disabled={!props.userId}
          >
            {!props.userId
              ? 'Please login to leave a comment'
              : 'Write a comment'}
          </button>
        )}
      </div>
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
  if (!overview) {
    return { props: { overview: null } };
  }
  if (!userId) {
    return {
      props: { overview, comments },
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
    props: { overview, userId, csrfToken, comments, isFavorite },
  };
}
