import Link from 'next/link';
import { useContext, useEffect } from 'react';
import { profileContext } from '../context/ProfileProvider';

type Props = {
  children: JSX.Element;
};
export default function Layout(props: Props) {
  const { userProfile, handleUserProfile } = useContext(profileContext);
  useEffect(() => {
    handleUserProfile();
  }, [handleUserProfile]);
  return (
    <>
      <header className="bg-transparent px-20 py-6 font-bold tracking-wider text-xl w-[50%] mx-auto">
        <nav className="flex justify-between">
          <Link href="/">Home</Link>
          {!userProfile ? (
            <div className="space-x-8">
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </div>
          ) : (
            <div className="space-x-8">
              <Link href="/profile">{userProfile}</Link>
              <Link href="/logout">Logout</Link>
            </div>
          )}
        </nav>
      </header>
      {props.children}
    </>
  );
}
