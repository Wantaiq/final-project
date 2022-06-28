import { GetServerSidePropsContext } from 'next';
import { getAllStoryChaptersByStoryId } from '../../util/database';

type Props = {
  chapters:
    | {
        title: any;
        heading: any;
        content: any;
        sortPosition: number;
      }[]
    | null;
};
export default function Story(props: Props) {
  if (props.chapters === null) {
    return (
      <div className="mx-auto my-24 w-fit">
        <h1 className="font-bold text-3xl tracking-wide text-amber-600">
          We couldn't find your story
        </h1>
      </div>
    );
  }
  return (
    <div className="w-[50%] mx-auto my-4 ">
      <div className="px-6 border-b-2 mb-6 pb-6">
        <h1 className="font-bold text-3xl tracking-wide text-amber-600">
          {props.chapters[0].title}
        </h1>
      </div>
      {props.chapters.map((chapter) => {
        return (
          <div key={`chapterTitle-${chapter.title}`} className="px-6">
            <h2 className="text-2xl mb-6 tracking-wide font-bold">
              #{chapter.sortPosition} <span>{chapter.heading}</span>
            </h2>
            <div className="px-4">
              <p className="text-lg tracking-wide">{chapter.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const chapters = await getAllStoryChaptersByStoryId(
    Number(context.query.storyId),
  );
  console.log(chapters);
  if (chapters.length > 0) {
    return {
      props: { chapters },
    };
  }
  return { props: { chapters: null } };
}
