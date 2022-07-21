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
    <ul className="flex">
      {pageNumbers.map((pageNumber) => {
        return (
          <li key={`pageNumber-${pageNumber}`}>
            <button onClick={() => props.paginate(pageNumber)}>
              {pageNumber}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
