import { GetServerSidePropsContext } from 'next';
import { getAllStories } from '../../util/database';

type Props = {
  stories: {
    username: string;
    title: string;
    description: string;
    timestamp: string;
  }[];
};
export default function Stories(props: Props) {
  return <h1>Hi</h1>;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const stories = await getAllStories();
  console.log(stories);
  return {
    props: { random: 'random' },
  };
}
