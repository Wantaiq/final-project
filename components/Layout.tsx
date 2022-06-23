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
      <header>
        <nav>
          <Link href="/">Home</Link>
          {userProfile && <p>{userProfile}</p>}
          {!userProfile && (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
          {userProfile && (
            <>
              <Link href="/profile">Profile</Link>
              <Link href="/logout">Logout</Link>
            </>
          )}
        </nav>
      </header>
      {props.children}
    </>
  );
}
