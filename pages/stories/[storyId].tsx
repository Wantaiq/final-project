import { GetServerSidePropsContext } from 'next';
import { useState } from 'react';
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
  const [currentChapter, setCurrentChapter] = useState(0);
  if (props.chapters === null) {
    return (
      <div className="mx-auto my-24 w-fit">
        <h1 className="font-bold text-3xl tracking-wide text-amber-600">
          We couldn't find your story
        </h1>
      </div>
    );
  }
  function nextChapter() {
    setCurrentChapter((prevChapter) =>
      prevChapter === props.chapters.length - 1 ? 0 : prevChapter + 1,
    );
  }

  function previousChapter() {
    setCurrentChapter((prevChapter) =>
      prevChapter === 0 ? props.chapters.length - 1 : prevChapter - 1,
    );
  }
  return (
    <div className="w-[50%] mx-auto my-4 ">
      <div className="px-6 border-b-2 mb-6 pb-6">
        <h1 className="font-bold text-3xl tracking-wide text-amber-600">
          {props.chapters[0].title}
        </h1>
      </div>
      {props.chapters.map((chapter, index) => {
        return (
          <div
            key={`chapterTitle-${chapter.heading}`}
            className={`px-8 my-6 ${
              index === currentChapter ? 'block' : 'hidden'
            } `}
          >
            <h2 className="text-2xl mb-6 tracking-wide font-bold text-amber-500">
              {chapter.heading}
            </h2>
            <div>
              <p className="text-lg tracking-wide leading-8">
                {chapter.content}
              </p>
            </div>
            <div className="flex justify-between w-[50%] mx-auto my-20">
              <button onClick={() => previousChapter()}>Previous</button>
              <button onClick={() => nextChapter()}>Next</button>
              {currentChapter === props.chapters.length - 1 ? (
                <button>Overview</button>
              ) : null}
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
  if (chapters.length > 0) {
    return {
      props: { chapters },
    };
  }
  return { props: { chapters: null } };
}
