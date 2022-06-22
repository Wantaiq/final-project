import Link from 'next/link';

type Props = {
  children: JSX.Element;
};
export default function Layout(props: Props) {
  return (
    <>
      <header>
        <nav>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
          <Link href="/profile">Profile</Link>
          <Link href="/logout">Logout</Link>
        </nav>
      </header>
      {props.children}
    </>
  );
}
