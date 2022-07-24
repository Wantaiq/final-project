import { BookOpenIcon } from '@heroicons/react/outline';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Pagination from '../../components/Pagination';
import {
  getAllUserStoriesByUserId,
  getUserProfileByUsername,
  UserProfile,
  UserStory,
} from '../../util/database';

type Props = { userProfileInfo: UserProfile | null; userStories: UserStory[] };
export default function Profile(props: Props) {
  const numberOfStories = props.userStories.length;
  const storiesPerPage = 4;
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfPreviousStory = currentPage * storiesPerPage;
  const indexOfFirstStory = indexOfPreviousStory - storiesPerPage;
  const currentStories = props.userStories.slice(
    indexOfFirstStory,
    indexOfPreviousStory,
  );

  function paginate(pageNumber: number) {
    setCurrentPage(pageNumber);
  }
  if (props.userProfileInfo === null) {
    return <h1>User not found</h1>;
  }
  return (
    <>
      <Head>
        <title>{props.userProfileInfo.username}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-full">
        <div className="flex h-full items-start bg-ink-blot bg-[top_-20px_right_1200px] bg-no-repeat bg-[length:1200px] px-56">
          <div className="flex flex-col items-center justify-start w-[30%] h-full px-12 py-20">
            <div className="flex items-start justify-center space-x-6">
              <div className="flex flex-col items-center space-y-4 shrink-0">
                <Image
                  src={props.userProfileInfo.avatar}
                  width={120}
                  height={120}
                  className="rounded-full"
                  alt="Profile picture"
                />
              </div>
              <div className="mt-6 flex flex-col space-y-2 items-center p-[1em] ">
                <p className="font-bold text-2xl tracking-wider text-slate-200">
                  {props.userProfileInfo.username}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="font-bold text-2xl text-cyan-400">
                    {numberOfStories}
                  </p>
                  <p className="text-slate-200">
                    {numberOfStories === 1 ? 'Story' : 'Stories'}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xl tracking-wide text-slate-300 font-bold mt-6">
              {!props.userProfileInfo.bio
                ? `Mysterious person that loves to read and write stories.`
                : props.userProfileInfo.bio}
            </p>
          </div>
          {/* Tabs */}
          <section className="flex flex-col pb-4 mx-auto mt-32 w-[75%] justify-center items-center">
            <div className="w-fit mb-10">
              <p className="font-bold text-xl pb-4 tracking-wide text-slate-50 scale-100 duration-200 ease-in hover:scale-105 focus:scale-105 border-b-2 border-cyan-300">
                {props.userProfileInfo.username}'s stories
              </p>
            </div>
            {/* Stories */}
            <div className="w-[95%] mx-auto h-full grid grid-cols-2 gap-x-10 gap-y-10">
              {currentStories.map((story) => {
                return (
                  <div
                    key={`storyId-${story.id}`}
                    className="w-full shrink-0 px-10 justify-start py-4 shadow-md shadow-black"
                  >
                    <div className="flex">
                      <div className="shrink-0">
                        <Image
                          src={story.coverImgUrl}
                          alt={`${story.title} book cover`}
                          width={200}
                          height={250}
                        />
                      </div>
                      <div className="py-4 px-4 flex flex-col justify-between break-words">
                        <div className="space-y-2">
                          <p className="text-slate-200 border-b-2 pb-2 border-b-cyan-500 font-bold tracking-wide">
                            {story.title}
                          </p>
                          <p className="font-semibold text-sm line-clamp-4 text-slate-200 pt-2">
                            {story.description}
                          </p>
                        </div>
                        <div>
                          <div className="py-2 px-3 rounded-md w-fit text-sm mb-auto">
                            <Link
                              href={`/stories?q=${story.category.toLowerCase()}`}
                            >
                              <a className="mt-12  bg-cyan-500/70 px-[0.5em] py-[.1em] rounded font-bold opacity-75 hover:text-slate-200">
                                {story.category.toLowerCase()}
                              </a>
                            </Link>
                          </div>
                          <div className="flex space-x-4 min-w-[90%] mx-auto shrink-0 mt-auto">
                            <Link href={`/stories/${story.id}`}>
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
                  </div>
                );
              })}
              <div className="absolute bottom-[50px] right-[50%] left-[50%]">
                <Pagination
                  storiesPerPage={storiesPerPage}
                  totalStories={numberOfStories}
                  paginate={paginate}
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  if (typeof context.query.username !== 'string') return { props: {} };
  const userProfileInfo = (await getUserProfileByUsername(
    context.query.username,
  )) as UserProfile | undefined;
  if (userProfileInfo) {
    const userStories = await getAllUserStoriesByUserId(userProfileInfo.userId);
    return {
      props: { userProfileInfo, userStories },
    };
  }

  return {
    props: { userProfileInfo: null },
  };
}
