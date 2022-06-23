import { GetServerSidePropsContext } from 'next';
import { useState } from 'react';
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
  const [userStories, setUserStories] = useState(props.userStories);
  const [newUserStoryTitle, setNewUserStoryTitle] = useState('');
  const [chapterOneUserInput, setChapterOneUserInput] = useState('');
  const [chapterTwoUserInput, setChapterTwoUserInput] = useState('');
  const [chapterThreeUserInput, setChapterThreeUserInput] = useState('');
  const [chapterFourUserInput, setChapterFourUserInput] = useState('');
  const [chapterFiveUserInput, setChapterFiveUserInput] = useState('');
  const [chapterSixUserInput, setChapterSixUserInput] = useState('');

  async function createStoryHandler() {
    const response = await fetch('http://localhost:3000/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        csrfToken: props.csrfToken,
        chapterOne: chapterOneUserInput,
        chapterTwo: chapterTwoUserInput,
        chapterThree: chapterThreeUserInput,
        chapterFour: chapterFourUserInput,
        chapterFive: chapterFiveUserInput,
        chapterSix: chapterSixUserInput,
        title: newUserStoryTitle,
        userId: props.userProfile.userId,
      }),
    });
    const data = await response.json();
    console.log(data);
    setUserStories((prevState) => [...prevState, data.newStory]);
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
      <h1>Username : {props.userProfile.username}</h1>
      <h2>Bio : {props.userProfile.bio}</h2>
      <p>Update profile</p>
      {/* Create story */}
      <label htmlFor="title">Title:</label>
      <input
        id="title"
        maxLength={50}
        onChange={(e) => setNewUserStoryTitle(e.currentTarget.value)}
      />
      <label htmlFor="chapterOne">Chapter One :</label>
      <textarea
        id="chapterOne"
        onChange={(e) => setChapterOneUserInput(e.currentTarget.value)}
      />
      <label htmlFor="chapterTwo">Chapter Two :</label>
      <textarea
        id="chapterTwo"
        onChange={(e) => setChapterTwoUserInput(e.currentTarget.value)}
      />
      <label htmlFor="chapterThree">Chapter Three :</label>
      <textarea
        id="chapterThree"
        onChange={(e) => setChapterThreeUserInput(e.currentTarget.value)}
      />
      <label htmlFor="chapterFour">Chapter Four :</label>
      <textarea
        id="chapterFour"
        onChange={(e) => setChapterFourUserInput(e.currentTarget.value)}
      />
      <label htmlFor="chapterFive">Chapter Five :</label>
      <textarea
        id="chapterFive"
        onChange={(e) => setChapterFiveUserInput(e.currentTarget.value)}
      />
      <label htmlFor="chapterSix">Chapter Six :</label>
      <textarea
        id="chapterSix"
        onChange={(e) => setChapterSixUserInput(e.currentTarget.value)}
      />
      <button onClick={() => createStoryHandler()}>Create new story</button>
      {/* Display stories */}
      {userStories.length === 0 ? (
        <p>You don't have any stories</p>
      ) : (
        userStories.map((story) => {
          return (
            <div key={`userStoryId-${story.id}`}>
              <h2>Story : {story.title}</h2>
              <p> Chapter One: {story.chapterOne}</p>
              <p>Chapter Two: {story.chapterTwo}</p>
              <p>Chapter Three : {story.chapterThree}</p>
              <p>Chapter Four: {story.chapterFour}</p>
              <p>Chapter Five:{story.chapterFive}</p>
              <p>Chapter Six:{story.chapterSix}</p>
              <button onClick={() => deleteStoryHandler(story.id)}>
                Delete Story
              </button>
            </div>
          );
        })
      )}
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
