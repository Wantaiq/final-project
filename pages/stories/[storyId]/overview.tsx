import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  getCurrentUserIdBySessionToken,
  getStoryOverviewByStoryId,
  StoryOverview,
} from '../../../util/database';

type Props = {
  overview: StoryOverview;
  userId?: number;
};
type Comment = {
  comment: string;
};
export default function Overview(props: Props) {
  console.log(props);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Comment>();
  const [isComment, setIsComment] = useState(false);
  async function createNewCommentHandler(commentInput: Comment) {
    console.log(commentInput);
  }
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
        >
          Write a comment
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

  if (!overview) {
    return { props: { overview: null } };
  }
  if (!userId) {
    return {
      props: { overview },
    };
  }
  return {
    props: { overview, userId },
  };
}
