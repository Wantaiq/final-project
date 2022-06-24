import { GetServerSidePropsContext } from 'next';
import { useState } from 'react';
import { createCsrfToken } from '../util/auth';
import {
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

type Chapters = {
  id: number;
  story_id: number;
  heading: 'string';
  content: 'string';
  sortPosition: number;
};

export default function Profile(props: Props) {
  const [userStories, setUserStories] = useState(props.userStories);
  const [newChapters, setNewChapters] = useState<Chapters[] | []>([]);
  const [storyTitle, setStoryTitle] = useState('');
  const [chapterHeading, setChapterHeading] = useState('');
  const [chapterNumber, setChapterNumber] = useState('');
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
    setNewStory(data.newStory);
    // setUserStories((prevState) => [...prevState, data.newStory]);
  }

  async function createNewChapterHandler() {
    const response = await fetch('http://localhost:3000/api/stories/chapters', {
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
    const data = await response.json();
    setNewChapters((prevChapters) => [...prevChapters, data.newChapter]);
  }
  // async function deleteStoryHandler(storyId: number) {
  //   const response = await fetch('http://localhost:3000/api/stories', {
  //     method: 'DELETE',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       csrfToken: props.csrfToken,
  //       storyId,
  //     }),
  //   });
  //   const { id } = await response.json();
  //   setUserStories((prevState) => prevState.filter((story) => story.id !== id));
  // }

  return (
    <>
      <h1>Username : {props.userProfile.username}</h1>
      <h2>Bio : {props.userProfile.bio}</h2>
      <p>Update profile</p>
      {/* Create story */}
      <label htmlFor="title">Title:</label>
      <input
        id="title"
        maxLength={50}
        onChange={(e) => setStoryTitle(e.currentTarget.value)}
      />
      <label htmlFor="description">Description :</label>
      <textarea
        id="description"
        onChange={(e) => setStoryDescription(e.currentTarget.value)}
      />
      <button onClick={() => createStoryHandler()}>Create story</button>
      <hr />
      <label htmlFor="chapterNumber">Chapter number :</label>
      <input
        id="chapterNumber"
        type="number"
        onChange={(e) => setChapterNumber(e.currentTarget.value)}
      />
      <hr />
      <label htmlFor="chapterHeading">Chapter heading :</label>
      <input
        id="chapterHeading"
        onChange={(e) => setChapterHeading(e.currentTarget.value)}
      />
      <hr />

      <label htmlFor="chapterContent">Chapter :</label>
      <textarea
        id="chapterContent"
        onChange={(e) => setChapterContent(e.currentTarget.value)}
      />
      <hr />
      <button onClick={() => createNewChapterHandler()}>Create chapter</button>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userProfile = await getUserProfileByValidSessionToken(
    context.req.cookies.sessionToken,
  );
  if (userProfile) {
    const { csrfSeed } = await getCsrfSeedByValidUserToken(
      context.req.cookies.sessionToken,
    );
    const csrfToken = createCsrfToken(csrfSeed);
    return {
      props: {
        userProfile,
        csrfToken,
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
