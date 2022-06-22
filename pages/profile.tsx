import { GetServerSidePropsContext } from 'next';
import {
  getUserProfileByValidSessionToken,
  UserProfile,
} from '../util/database';

type Props = { userProfile: UserProfile };
export default function Profile(props: Props) {
  return (
    <>
      <h1>Username : {props.userProfile.username}</h1>
      <h2>Bio : {props.userProfile.bio}</h2>
      <p>Update profile</p>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Not sure about this one
  const userProfile = await getUserProfileByValidSessionToken(
    context.req.cookies.sessionToken,
  );

  if (userProfile) {
    return {
      props: {
        userProfile,
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
