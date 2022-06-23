import { GetServerSidePropsContext } from 'next';
import {
  getUserProfileByUsername,
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
          <div key={`userStory-${story.id}`}>
            <h1>{story.title}</h1>
            <h2>{story.story}</h2>
          </div>
        );
      })}
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  if (typeof context.query.username !== 'string') return { props: {} };
  const userProfileInfo = (await getUserProfileByUsername(
    context.query.username,
  )) as UserProfile | undefined;
  if (userProfileInfo) {
    const userStories = await getUserStoriesByUserId(userProfileInfo.userId);
    return {
      props: { userProfileInfo: userProfileInfo, userStories: userStories },
    };
  }

  return {
    props: { userProfileInfo: null },
  };
}
