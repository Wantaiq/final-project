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
      <main className="mt-6 md:flex md:items-start md:space-x-20 md:mt-0 md:px-24">
        <div className="flex space-x-8 justify-center  border-b-2 border-cyan-400 pb-4 md:border-b-0">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div>
              <Image
                src={props.userProfileInfo.avatar}
                width={100}
                height={100}
                className="rounded-full"
                alt="Profile picture"
              />
            </div>
            <div>
              <p className="font-bold text-2xl tracking-wider text-slate-200">
                {props.userProfileInfo.username}
              </p>
              <div className="flex items-center space-x-4">
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
        <section className="my-4">
          <div className="md:grid md: grid-cols-2 md:gap-x-2 md:gap-y-2">
            {currentStories.map((story) => {
              return (
                <div
                  key={`storyId-${story.id}`}
                  className="shadow-lg shadow-black px-2 w-fit"
                >
                  <div className="flex items-center py-2 mt-4 md:mt-0">
                    <div className="shrink-0">
                      <Image
                        src={story.coverImgUrl}
                        alt={`${story.title} book cover`}
                        width={150}
                        height={200}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="flex flex-col h-[180px]">
                      <div className="text-slate-200 font-bold tracking-wide px-2">
                        <p className="text-slate-200 border-b-2 border-b-cyan-500 font-bold tracking-wide pb-2 break-words line-clamp-2">
                          {story.title}
                        </p>
                        <p
                          className="font-semibold text-sm md:line-clamp-3
                          line-clamp-2
                          text-slate-200 pt-2 break-all px-2"
                        >
                          {story.description}
                        </p>
                      </div>
                      <div className="px-3 rounded-md text-sm flex flex-col w-fit mt-auto">
                        <Link
                          href={`/stories?q=${story.category.toLowerCase()}`}
                        >
                          <a
                            className=" bg-cyan-200
                            text-gray-800 px-[0.1em] py-[.03em] rounded font-bold opacity-75
                            text-sm
                            w-fit
                            hover:text-slate-200"
                          >
                            {story.category.toLowerCase()}
                          </a>
                        </Link>
                        <div className="flex items-center justify-between space-x-2 md:space-x-2 mt-2">
                          <Link href={`/stories/${story.id}`}>
                            <a className="bg-cyan-500 py-[.2em] px-[.5em]  rounded-full text-gray-800 font-bold">
                              Read story
                            </a>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div>
              <Pagination
                storiesPerPage={storiesPerPage}
                totalStories={numberOfStories}
                paginate={paginate}
              />
            </div>
          </div>
        </section>
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
