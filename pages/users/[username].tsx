import { GetServerSidePropsContext } from 'next';
import { getUserProfileByUsername, UserProfile } from '../../util/database';

type Props = { userProfileInfo: UserProfile | null };
export default function Profile(props: Props) {
  if (!props.userProfileInfo) {
    return <h1>User not found</h1>;
  }
  return (
    <>
      <h1>Username : {props.userProfileInfo.username}</h1>
      <h2>Bio : {props.userProfileInfo.bio}</h2>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  if (typeof context.query.username !== 'string') return { props: {} };
  const userProfileInfo = await getUserProfileByUsername(
    context.query.username,
  );
  return {
    props: { userProfileInfo: userProfileInfo || null },
  };
}
