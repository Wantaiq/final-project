import { GetServerSidePropsContext } from 'next';
import { useEffect, useState } from 'react';
import { createCsrfToken } from '../util/auth';
import {
  getCsrfSeedByValidUserToken,
  getUserProfileByValidSessionToken,
  getUserStoriesByUserId,
  UserProfile,
  UserStory,
} from '../util/database';

type Props = {
  userProfile: UserProfile;
  csrfToken: string;
  userStories: UserStory[];
};

export default function Profile(props: Props) {
  const [newUserStoryTitle, setNewUserStoryTitle] = useState('');
  const [newUserStory, setNewUserStory] = useState('');
  const [userStories, setUserStories] = useState(props.userStories);

  async function createStoryHandler() {
    const response = await fetch('http://localhost:3000/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        csrfToken: props.csrfToken,
        story: newUserStory,
        title: newUserStoryTitle,
        userId: props.userProfile.userId,
      }),
    });
    const data = await response.json();
    setUserStories((prevState) => [...prevState, data.newStory]);
  }
  return (
    <>
      <h1>Username : {props.userProfile.username}</h1>
      <h2>Bio : {props.userProfile.bio}</h2>
      <p>Update profile</p>
      <label htmlFor="title">Title:</label>
      <input
        id="title"
        maxLength={50}
        onChange={(e) => setNewUserStoryTitle(e.currentTarget.value)}
      />
      <label htmlFor="story">Story</label>
      <textarea
        id="story"
        onChange={(e) => setNewUserStory(e.currentTarget.value)}
      />
      <button onClick={() => createStoryHandler()}>Create new story</button>
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
    const userStories = await getUserStoriesByUserId(userProfile.userId);
    return {
      props: {
        userProfile,
        csrfToken,
        userStories: userStories,
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
