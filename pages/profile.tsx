import { GetServerSidePropsContext } from 'next';
import { useState } from 'react';
import { createCsrfToken } from '../util/auth';
import {
  getAllUserStoriesByUserId,
  getCsrfSeedByValidUserToken,
  getUserProfileByValidSessionToken,
  UserProfile,
  UserStory,
} from '../util/database';

type Props = {
  userProfile: UserProfile;
  csrfToken: string;
  userStories: UserStory[];
};

// Refactor form
export default function Profile(props: Props) {
  const [userStories, setUserStories] = useState(props.userStories);
  const [storyTitle, setStoryTitle] = useState('');
  const [chapterHeading, setChapterHeading] = useState('');
  const [chapterNumber, setChapterNumber] = useState(1);
  const [chapterContent, setChapterContent] = useState('');
  const [storyDescription, setStoryDescription] = useState('');
  const [newStory, setNewStory] = useState<UserStory | undefined>(undefined);

  async function createStoryHandler() {
    const response = await fetch('http://localhost:3000/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        csrfToken: props.csrfToken,
        title: storyTitle,
        description: storyDescription,
        userId: props.userProfile.userId,
      }),
    });
    const data: { newStory: UserStory } = await response.json();
    setUserStories((prevStories) => [data.newStory, ...prevStories]);
    setNewStory(data.newStory);
  }

  async function createNewChapterHandler() {
    await fetch('http://localhost:3000/api/stories/chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        csrfToken: props.csrfToken,
        storyId: newStory?.id,
        heading: chapterHeading,
        content: chapterContent,
        sortPosition: chapterNumber,
      }),
    });
    setChapterContent('');
    setChapterHeading('');
    setChapterNumber((prevNumber) => prevNumber + 1);
  }

  async function deleteStoryHandler(storyId: number) {
    const response = await fetch('http://localhost:3000/api/stories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        csrfToken: props.csrfToken,
        storyId,
      }),
    });
    const { id } = await response.json();
    setUserStories((prevState) => prevState.filter((story) => story.id !== id));
  }

  return (
    <>
      {/* Profile */}
      <div className="p-20 w-[65%] border-b-2 mx-auto flex justify-between">
        <div className="flex space-x-14">
          <div className="flex flex-col space-y-4">
            <div className="bg-white w-[175px] h-[175px] rounded-full" />
            <button className="bg-amber-600 py-[0.4em] rounded font-medium tracking-wider">
              Update profile
            </button>
          </div>
          <div className="space-y-8 mt-6">
            <h1 className="font-bold text-2xl tracking-wider text-amber-500">
              {props.userProfile.username}
            </h1>
            <p className="">
              <span className="font-bold text-3xl">
                {props.userStories.length}
              </span>{' '}
              Stories
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-xl tracking-wide opacity-70">
            {!props.userProfile.bio
              ? `Mysterious person that loves to read and write stories`
              : props.userProfile.bio}
          </h2>
        </div>
      </div>
      <div className="w-[65%] mx-auto flex justify-between px-44 py-6 border-b-2">
        <div className="font-bold text-xl tracking-wide">
          <p className="border-b-2 border-amber-600 pb-[0.2em]">
            Latest stories
          </p>
        </div>
        <div className="font-bold text-xl tracking-wide">Stories</div>
        <div className="font-bold text-xl tracking-wide">Comments</div>
      </div>
      <div className="w-[65%] mx-auto flex justify-evenly px-14 py-8">
        {props.userStories.slice(0, 4).map((story) => {
          return (
            <div
              key={`storyId-${story.id}`}
              className="border-2 w-[20%] px-6 py-12 rounded-lg"
            >
              <h1 className="font-bold text-lg tracking-wide text-amber-400 mb-4 border-b-2 pb-4">
                {story.title}
              </h1>
              <h2 className="">{story.description}</h2>
            </div>
          );
        })}
      </div>
      {/* Display stories */}
      {/* Create story */}
      {/* <label htmlFor="title">Title:</label>
      <input
      id="title"
      maxLength={50}
      value={storyTitle}
      onChange={(e) => setStoryTitle(e.currentTarget.value)}
      />
      <label htmlFor="description">Description :</label>
      <textarea
      id="description"
      value={storyDescription}
      onChange={(e) => setStoryDescription(e.currentTarget.value)}
      />
      <button onClick={() => createStoryHandler()}>Create story</button>
      <hr />
      <p>Chapter #{chapterNumber}</p>
      <hr />
      <label htmlFor="chapterHeading">Chapter heading :</label>
      <input
      id="chapterHeading"
      value={chapterHeading}
      onChange={(e) => setChapterHeading(e.currentTarget.value)}
      />
      <hr />

      <label htmlFor="chapterContent">Chapter :</label>
      <textarea
        id="chapterContent"
        value={chapterContent}
        onChange={(e) => setChapterContent(e.currentTarget.value)}
      />
      <hr />
      <button onClick={() => createNewChapterHandler()}>Create chapter</button> */}
      {/* display stories */}
      {/* {userStories.map((story) => {
        return (
          <div key={`storyId-${story.id}`}>
            <h1>{story.title}</h1>
            <p>{story.description}</p>
            <button onClick={() => deleteStoryHandler(story.id)}>
              Delete story
            </button>
          </div>
        );
      })} */}
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userProfile = await getUserProfileByValidSessionToken(
    context.req.cookies.sessionToken,
  );
  if (userProfile) {
    const userStories = await getAllUserStoriesByUserId(userProfile.userId);
    const { csrfSeed } = await getCsrfSeedByValidUserToken(
      context.req.cookies.sessionToken,
    );
    const csrfToken = createCsrfToken(csrfSeed);
    return {
      props: {
        userProfile,
        csrfToken,
        userStories,
      },
    };
  }
  return {
    redirect: {
      destination: '/login?returnTo=/profile',
      permanent: false,
    },
  };
}
