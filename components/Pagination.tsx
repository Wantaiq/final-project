type Props = {
  totalStories: number;
  storiesPerPage: number;
  paginate: (param: number) => void;
};
export default function Pagination(props: Props) {
  const pageNumbers = [];
  for (
    let i = 1;
    i <= Math.ceil(props.totalStories / props.storiesPerPage);
    i++
  ) {
    pageNumbers.push(i);
  }
  return (
    <ul className="flex my-4 mx-auto w-[50%]">
      {pageNumbers.map((pageNumber) => {
        return (
          <li key={`pageNumber-${pageNumber}`}>
            <button
              aria-label={`${pageNumber} page`}
              onClick={() => props.paginate(pageNumber)}
              className="border-2 py-[.2em] px-[.6em] mx-3 border-cyan-400 text-slate-300 font-semibold text-sm  ease-in-out duration-300 rounded scale-100 transition-all hover:scale-110 focus:scale-110 hover:border-cyan-200 focus:border-cyan-200"
            >
              {pageNumber}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
