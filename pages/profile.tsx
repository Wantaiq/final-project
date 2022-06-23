import { GetServerSidePropsContext } from 'next';
import { createCsrfToken } from '../util/auth';
import {
  getCsrfSeedByValidUserToken,
  getUserProfileByValidSessionToken,
  UserProfile,
} from '../util/database';

type Props = { userProfile: UserProfile; csrfToken: string };
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
  const userProfile = await getUserProfileByValidSessionToken(
    context.req.cookies.sessionToken,
  );
  const { csrfSeed } = await getCsrfSeedByValidUserToken(
    context.req.cookies.sessionToken,
  );
  const csrfToken = createCsrfToken(csrfSeed);
  if (userProfile) {
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
