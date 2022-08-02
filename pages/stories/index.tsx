import { BookOpenIcon } from '@heroicons/react/outline';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useContext, useEffect } from 'react';
import Slider from 'react-slick';
import { profileContext } from '../../context/ProfileProvider';
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
    responsive: [
      {
        breakpoint: 1050,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
    ],
  };

  const { handleUserProfile } = useContext(profileContext);
  useEffect(() => {
    handleUserProfile();
  }, [handleUserProfile]);

  return (
    <>
      <Head>
        <title>Discover stories</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="md:w-[40%] mx-auto md:px-12 w-[60%]">
        <p className="text-xl text-slate-200 font-md italic">
          "If there is a book that you want to read, but it hasn't been written
          yet, then you must write it."
        </p>
        <p className="text-md text-slate-200/70 font-bold italic indent-4">
          -Toni Morrison
        </p>
      </div>
      <div className="mt-10 px-12 overflow-x-scroll small-scrollbar">
        <nav className="flex justify-center items-center md:border-b-2 w-fit mx-auto md:space-x-12 space-x-6 text-sm pb-4">
          <Link href="/stories">
            <a
              className={`font-semibold text-slate-300 py-2 ${
                props.query === null && 'border-b-2 border-cyan-500'
              }`}
            >
              Recent
            </a>
          </Link>
          <Link href="/stories?q=mystery">
            <a
              className={`font-semibold text-slate-300 py-2 mx-10 ${
                props.query === 'mystery' && 'border-b-2 border-cyan-500'
              }`}
            >
              Mystery
            </a>
          </Link>
          <Link href="/stories?q=adventure">
            <a
              className={`font-semibold text-slate-300 py-2 mx-10 ${
                props.query === 'adventure' && 'border-b-2 border-cyan-500'
              }`}
            >
              Adventure
            </a>
          </Link>
          <Link href="/stories?q=short">
            <a
              className={`font-semibold text-slate-300 py-2 mx-10 ${
                props.query === 'short' && 'border-b-2 border-cyan-500'
              }`}
            >
              Short
            </a>
          </Link>
          <Link href="/stories?q=humor">
            <a
              className={`font-semibold text-slate-300 py-2 mx-10 ${
                props.query === 'humor' && 'border-b-2 border-cyan-500'
              }`}
            >
              Humor
            </a>
          </Link>
          <Link href="/stories?q=fantasy">
            <a
              className={`font-semibold text-slate-300 py-2 mx-10 ${
                props.query === 'fantasy' && 'border-b-2 border-cyan-500'
              }`}
            >
              Fantasy
            </a>
          </Link>
          <Link href="/stories?q=other">
            <a
              className={`font-semibold text-slate-300 py-2 mx-10 ${
                props.query === 'other' && 'text-cyan-300'
              }`}
            >
              Other
            </a>
          </Link>
        </nav>
      </div>
      <main>
        <div className="mx-auto mt-10 shadow-md shadow-black w-[80%]">
          <Slider {...settings}>
            {stories.map((story) => {
              return (
                <div key={`storyId-${story.id}`} className="px-2 py-4">
                  <div className="flex">
                    <div className="shrink-0">
                      <Image
                        src={story.coverImgUrl}
                        alt={`${story.title} book cover`}
                        width={150}
                        height={200}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="px-4 break-all line-clamp-3">
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
                        <p className="font-semibold text-sm md:line-clamp-4 line-clamp-3 text-slate-200">
                          {story.description}
                        </p>
                      </div>
                      <div className="px-3 rounded-md text-sm absolute bottom-0 pb-4 flex flex-col">
                        <Link
                          href={`/stories?q=${story.category.toLowerCase()}`}
                        >
                          <a className=" bg-cyan-200 text-gray-800 px-[0.1em] py-[.03em] rounded font-bold opacity-75 hover:text-slate-200 w-fit text-xs">
                            {story.category.toLowerCase()}
                          </a>
                        </Link>
                        <Link href={`/stories/${story.id}`}>
                          <a className="bg-cyan-500 mt-2 py-[.1em] px-[.4em] rounded-full">
                            <BookOpenIcon
                              width="30"
                              height="20"
                              stroke="#ffffff"
                              className="inline"
                            />
                            <span className="font-bold text-slate-200">
                              Read story
                            </span>
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
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const query = context.query.q || null;
  const stories = await getAllStories();
  return {
    props: { stories, query },
  };
}
