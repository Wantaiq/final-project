import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import {
  getAllUserStoriesByUserId,
  getUserProfileByUsername,
  UserProfile,
  UserStory,
} from '../../util/database';

type Props = { userProfileInfo: UserProfile | null; userStories: UserStory[] };
export default function Profile(props: Props) {
  if (props.userProfileInfo === null) {
    return <h1>User not found</h1>;
  }
  return (
    <>
      <h1>Username : {props.userProfileInfo.username}</h1>
      <h2>Bio : {props.userProfileInfo.bio}</h2>
      {/* Stories */}
      {props.userStories.map((story) => {
        return (
          <div key={`storyId-${story.id}`}>
            <Link href={`/stories/${story.id}`}>
              <div>
                <h1>{story.title}</h1>
                <p>{story.description}</p>
              </div>
            </Link>
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
    const userStories = await getAllUserStoriesByUserId(userProfileInfo.userId);
    return {
      props: { userProfileInfo, userStories },
    };
  }

  return {
    props: { userProfileInfo: null },
  };
}
