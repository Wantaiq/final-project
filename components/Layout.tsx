import Image from 'next/image';
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
          <Link href="/">Qualia</Link>

          <div className="space-x-8 flex items-center justify-center">
            <Link href="/stories">Discover stories</Link>
            {!userProfile ? (
              <>
                <Link href="/login">Login</Link>
                <Link href="/register">Register</Link>
              </>
            ) : (
              <>
                <div className="flex space-x-4 cursor-pointer">
                  <Link href="/profile">
                    <a>
                      <Image
                        src={userProfile.avatar}
                        alt="Profile picture"
                        width={30}
                        height={30}
                        className="rounded-full"
                      />
                    </a>
                  </Link>
                </div>
                <Link href="/logout">Logout</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      {props.children}
    </>
  );
}
