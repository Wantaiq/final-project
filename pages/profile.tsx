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
      <h1>Username : {props.userProfile.username}</h1>
      <h2>Bio : {props.userProfile.bio}</h2>
      <p>Update profile</p>
      {/* Create story */}
      <label htmlFor="title">Title:</label>
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
      <button onClick={() => createNewChapterHandler()}>Create chapter</button>
      {/* display stories */}
      {userStories.map((story) => {
        return (
          <div key={`storyId-${story.id}`}>
            <h1>{story.title}</h1>
            <p>{story.description}</p>
            <button onClick={() => deleteStoryHandler(story.id)}>
              Delete story
            </button>
          </div>
        );
      })}
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
