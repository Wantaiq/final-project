import { BookOpenIcon } from '@heroicons/react/outline';
import { GetServerSidePropsContext } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Slider from 'react-slick';
import { AllStories, getAllStories } from '../../util/database';

type Props = {
  stories: AllStories;
  query: string | null;
};
export default function Stories(props: Props) {
  const stories = props.query
    ? props.stories.filter((item) => item.category === props.query)
    : props.stories;

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 3,
    slidesToScroll: 2,
  };

  return (
    <div className="w-full min-h-full bg-ink-blot bg-[top_right_1100px] bg-no-repeat bg-[length:1800px]">
      <div className="mt-24">
        <nav className="flex justify-center items-center border-b-2 w-[50%] mx-auto py-2 space-x-12 text-sm">
          <Link href="/stories">
            <a
              className={`font-semibold text-slate-300 py-2 mx-10 px-2 ${
                props.query === null && ' text-cyan-300'
              }`}
            >
              Recent
            </a>
          </Link>
          <Link href="/stories?q=mystery">
            <a
              className={`font-semibold text-slate-300 py-2 mx-10 px-2 ${
                props.query === 'mystery' && 'text-cyan-300'
              }`}
            >
              Mystery
            </a>
          </Link>
          <Link href="/stories?q=adventure">
            <a
              className={`font-semibold text-slate-300 py-2 mx-10 px-2 ${
                props.query === 'adventure' && 'text-cyan-300'
              }`}
            >
              Adventure
            </a>
          </Link>
          <Link href="/stories?q=short">
            <a
              className={`font-semibold text-slate-300 py-2 mx-10 px-2 ${
                props.query === 'short' && 'text-cyan-300'
              }`}
            >
              Short
            </a>
          </Link>
          <Link href="/stories?q=humor">
            <a
              className={`font-semibold text-slate-300 py-2 mx-10 px-2 ${
                props.query === 'humor' && 'text-cyan-300'
              }`}
            >
              Humor
            </a>
          </Link>
          <Link href="/stories?q=fantasy">
            <a
              className={`font-semibold text-slate-300 py-2 mx-10 px-2 ${
                props.query === 'fantasy' && 'text-cyan-300'
              }`}
            >
              Fantasy
            </a>
          </Link>
          <Link href="/stories?q=other">
            <a
              className={`font-semibold text-slate-300 py-2 mx-10 px-2 ${
                props.query === 'other' && 'text-cyan-300'
              }`}
            >
              Other
            </a>
          </Link>
        </nav>
      </div>
      <main>
        <div className="mx-auto mt-20 shadow-md shadow-black w-[80%]">
          <Slider {...settings}>
            {stories.map((story) => {
              return (
                <div
                  key={`storyId-${story.id}`}
                  className="group shrink-0 px-10 justify-start py-4"
                >
                  <div className="flex align-center justify-center transition-all duration-500 ease-in-out group-hover:scale-105">
                    <div className="shrink-0">
                      <Image
                        src={story.coverImgUrl}
                        alt={`${story.title} book cover`}
                        width={230}
                        height={280}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="flex py-4 px-4 flex-col justify-between break-all min-h-full">
                      <div className="space-y-2">
                        <p className="text-slate-200 font-bold tracking-wide">
                          {story.title}
                        </p>
                        <p className="font-semibold text-slate-200 mt-2 border-b-2 pb-3">
                          By:
                          <span className="text-cyan-400 font-semibold tracking-wider ml-2">
                            <Link href={`/users/${story.username}`}>
                              {story.username}
                            </Link>
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm line-clamp-6 text-slate-200 pt-2">
                          {story.description}
                        </p>
                      </div>
                      <div className="py-1 px-3 rounded-md text-sm mt-auto">
                        <Link
                          href={`/stories?q=${story.category.toLowerCase()}`}
                        >
                          <a className="mt-12  bg-cyan-500/50 px-[0.5em] py-[.1em] rounded font-bold opacity-75 hover:text-slate-200">
                            {story.category.toLowerCase()}
                          </a>
                        </Link>
                      </div>
                      <div className="flex space-x-4 min-w-[90%] mx-auto shrink-0 mt-1">
                        <Link href={`/stories/${story.id}/overview`}>
                          <a className="bg-cyan-800 rounded-full min-w-[190px] flex justify-center items-center scale-100 duration-200 ease-in  hover:scale-105 focus:scale-105 focus:bg-cyan-800 focus:text-slate-200 cursor-pointer">
                            <BookOpenIcon
                              width="40"
                              height="30"
                              stroke="#ffffff"
                            />
                            <p className="font-bold text-slate-200">
                              Read story
                            </p>
                          </a>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const query = context.query.q || null;
  const stories = await getAllStories();
  return {
    props: { stories, query },
  };
}
