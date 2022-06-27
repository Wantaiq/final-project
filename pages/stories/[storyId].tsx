import { GetServerSidePropsContext } from 'next';
import { getAllStoryChaptersByStoryId } from '../../util/database';

type Props = {
  chapters:
    | {
        title: any;
        heading: any;
        content: any;
        sort_position: number;
      }[]
    | null;
};
export default function Story(props: Props) {
  if (props.chapters === null) {
    return <h1>We couldn't find your story</h1>;
  }
  return (
    <>
      <h1>Hello</h1>
      <p>Hello</p>
      <h1>{props.chapters[0].title}</h1>
      {props.chapters.map((chapter) => {
        return (
          <div key={`chapterTitle-${chapter.title}`}>
            <p>{chapter.heading}</p>
            <p>{chapter.content}</p>
          </div>
        );
      })}
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const chapters = await getAllStoryChaptersByStoryId(
    Number(context.query.storyId),
  );
  if (chapters.length > 0) {
    return {
      props: { chapters },
    };
  }
  return { props: { chapters: null } };
}
