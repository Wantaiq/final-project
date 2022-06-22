import { GetServerSidePropsContext } from 'next';
import {
  getUserProfileByUsername,
  getUserProfileByValidSessionToken,
  UserProfile,
} from '../../util/database';

type Props = { userProfile: UserProfile; isAuth: boolean } | undefined;
export default function Profile(props: Props) {
  if (!props) {
    return <h1>User not found</h1>;
  }
  return (
    <>
      <h1>Username : {props.userProfile.username}</h1>
      <h2>Bio : {props.userProfile.bio}</h2>
      {props.isAuth ? <p>Update profile</p> : null}
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const userProfile = await getUserProfileByValidSessionToken(
    context.req.cookies.sessionToken,
  );

  if (!userProfile) {
    if (typeof context.query.username !== 'string') return { props: {} };
    const userProfileInfo = await getUserProfileByUsername(
      context.query.username,
    );
    return {
      props: { userProfile: userProfileInfo, isAuth: false },
    };
  }
  return {
    props: { userProfile, isAuth: true },
  };
}
