import Link from 'next/link';
import { getAllStories } from '../../util/database';

type Props = {
  stories: {
    id: number;
    username: string;
    title: string;
    description: string;
  }[];
};
export default function Stories(props: Props) {
  return (
    <div className="w-[75%] mx-auto mt-20">
      <div className="grid grid-cols-5 gap-6">
        {props.stories.map((story) => {
          return (
            <div
              key={`storyId-${story.id}`}
              className="border-2 px-6 py-12 rounded-lg"
            >
              <h1 className="font-bold text-lg tracking-wide text-amber-400 mb-4">
                <span>
                  <Link href={`/stories/${story.id}/overview`}>
                    {story.title}
                  </Link>
                </span>
              </h1>
              <h2 className="border-b-2 mb-4 pb-4 font-medium tracking-wide">
                {story.description}
              </h2>
              <p>
                Written by:{' '}
                <span>
                  <Link href={`/authors/${story.username}`}>
                    {story.username}
                  </Link>
                </span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const stories = await getAllStories();
  return {
    props: { stories },
  };
}
