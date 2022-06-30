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
  StoryOverview,
} from '../../../util/database';

type Props = {
  overview: StoryOverview | null;
  userId?: { id: number };
  csrfToken: string;
  comments: Comments;
};
type Comment = {
  comment: string;
};
export default function Overview(props: Props) {
  const { userProfile } = useContext(profileContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Comment>();
  const [isComment, setIsComment] = useState(false);
  const [storyComments, setStoryComments] = useState(props.comments);
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
        ...prevComments,
        { ...data.newComment, username: userProfile },
      ]);
    }
  }
  console.log(storyComments);
  if (props.overview === null) return <h1>Oops something went wrong</h1>;
  return (
    <div className="w-[75%] mx-auto mt-24">
      <div>
        <h1 className="font-bold text-lg mb-2 pb-2 text-amber-500">
          {props.overview.title}
        </h1>
        <h2 className="tracking-wide text-md mb-2">
          {props.overview.description}
        </h2>
        <p className="opacity-80 mb-4">Author: {props.overview.username}</p>
        <div className="border-b-2 px-[2em] border-amber-500 mb-6 bg-amber-500 w-fit py-[.5em] rounded">
          <Link href={`/stories/${props.overview.storyId}`}>Read story</Link>
        </div>
      </div>
      <div>
        {storyComments.length === 0 ? (
          <h1>Be the first one to comment!</h1>
        ) : (
          storyComments.map((item) => {
            return (
              <div key={`commentId-${item.id}`} className="border-2 mb-4">
                <h1>{item.username}</h1>
                <h2>{item.content}</h2>
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
              Let {props.overview.username} know what you think!
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
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
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
  return {
    props: { overview, userId, csrfToken, comments },
  };
}
