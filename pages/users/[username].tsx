import { GetServerSidePropsContext } from 'next';
import { getUserByUsername } from '../../util/database';

export default function UserProfile(props) {
  return (
    <>
      <h1>Hello</h1>
      <h2>Hi</h2>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const queriedUsername = context.query.username;
  if (!queriedUsername || Array.isArray(queriedUsername)) {
    return {
      props: {},
    };
  }
  // Create join table
  const userInformation = await getUserByUsername(queriedUsername);
  console.log(userInformation);

  return {
    props: {},
  };
}
