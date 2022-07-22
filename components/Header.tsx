import Image from 'next/image';
import Link from 'next/link';
import { AnchorHTMLAttributes, useContext, useEffect } from 'react';
import { profileContext } from '../context/ProfileProvider';

type Props = {
  children: JSX.Element;
};

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;

function Anchor({ children, ...restProps }: AnchorProps) {
  return <a {...restProps}>{children}</a>;
}
export default function Header(props: Props) {
  const { userProfile, handleUserProfile } = useContext(profileContext);
  useEffect(() => {
    handleUserProfile();
  }, [handleUserProfile]);
  return (
    <>
      <header className="bg-transparent font-bold tracking-wider text-xl mx-auto w-full px-80 py-2">
        <nav className="flex justify-between">
          <Link href="/">
            <a className="text-cyan-500 text-[2rem]">Qualia</a>
          </Link>

          <div className="space-x-8 flex items-center justify-center">
            <Link href="/stories">
              <a className="text-slate-200 hover:text-cyan-400">
                Discover stories
              </a>
            </Link>
            {!userProfile ? (
              <>
                <Link href="/login">
                  <a className="text-slate-200 hover:text-cyan-400">Login</a>
                </Link>
                <Link href="/registration">
                  <a className="text-slate-200 hover:text-cyan-400">Register</a>
                </Link>
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
                <Anchor href="/logout">
                  <a className="text-slate-200 hover:text-cyan-400">Logout</a>
                </Anchor>
              </>
            )}
          </div>
        </nav>
      </header>
      {props.children}
    </>
  );
}
