import Link from 'next/link';
import { AllStories, getAllStories } from '../../util/database';

type Props = {
  stories: AllStories[];
};
export default function Stories(props: Props) {
  return (
    <div className="w-[75%] mx-auto mt-20">
      <div className="grid grid-cols-5 gap-6">
        {props.stories.map((story) => {
          return (
            <div
              style={{ backgroundImage: `url(${story.coverImgUrl})` }}
              key={`storyId-${story.id}`}
              className="border-2 px-6 pt-12 pb-6 rounded-lg bg-center bg-cover bg-[#353434] bg-blend-overlay w-[275px] h-[350px]"
            >
              <h1 className="font-bold text-lg tracking-wide text-amber-400 mb-4 border-b-2 pb-4 text-shadow">
                <span>
                  <Link href={`/stories/${story.id}/overview`}>
                    {story.title}
                  </Link>
                </span>
              </h1>
              <p className="text-shadow">
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
