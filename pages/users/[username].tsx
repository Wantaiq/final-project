import { GetServerSidePropsContext } from 'next';
import {
  getUserIdByUsername,
  getUserProfileByUserId,
  getUserStoriesByUserId,
  UserProfile,
  UserStory,
} from '../../util/database';

type Props = { userProfileInfo: UserProfile | null; userStories: UserStory[] };
export default function Profile(props: Props) {
  if (!props.userProfileInfo) {
    return <h1>User not found</h1>;
  }
  return (
    <>
      <h1>Username : {props.userProfileInfo.username}</h1>
      <h2>Bio : {props.userProfileInfo.bio}</h2>
      {props.userStories.map((story) => {
        return (
          <div key={`userStoryId-${story.id}`}>
            <h2>Story : {story.title}</h2>
            <p> Chapter One: {story.chapterOne}</p>
            <p>Chapter Two: {story.chapterTwo}</p>
            <p>Chapter Three : {story.chapterThree}</p>
            <p>Chapter Four: {story.chapterFour}</p>
            <p>Chapter Five:{story.chapterFive}</p>
            <p>Chapter Six:{story.chapterSix}</p>
          </div>
        );
      })}
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  if (typeof context.query.username !== 'string') return { props: {} };
  const id: number | undefined = await getUserIdByUsername(
    context.query.username,
  );
  if (id) {
    const userProfileInfo = (await getUserProfileByUserId(id)) as
      | UserProfile
      | undefined;
    if (userProfileInfo) {
      const userStories = await getUserStoriesByUserId(userProfileInfo.userId);
      return {
        props: { userProfileInfo: userProfileInfo, userStories: userStories },
      };
    }
  }

  return {
    props: { userProfileInfo: null },
  };
}
