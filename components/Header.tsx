import { MenuIcon, XIcon } from '@heroicons/react/outline';
import Image from 'next/image';
import Link from 'next/link';
import { AnchorHTMLAttributes, useContext, useEffect, useState } from 'react';
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <>
      <header className="bg-transparent text-slate-300 font-md tracking-wider md:text-lg md:border-b-2 md:px-32 py-8 px-6 md:mb-8 w-full">
        <nav className="flex md:w-full justify-between md:items-center">
          <Link href="/">
            <a className="text-[2rem] md:block hidden">Qualia</a>
          </Link>
          <div
            className={`md:flex md:flex-row flex flex-col items-center md:justify-center pt-4 md:pt-0 md:space-x-8 font-medium md:space-y-0 md:w-[50%] md:ml-auto text-xl space-y-6 w-full ${
              isMenuOpen ? 'border-b-2 pb-4 w-[60%] mx-auto' : 'hidden'
            }`}
          >
            {isMenuOpen && (
              <Link href="/">
                <a className="text-[2rem] md:block">Qualia</a>
              </Link>
            )}
            <Link href="/stories">
              <a className="text-slate-200 hover:text-cyan-400">
                Discover stories
              </a>
            </Link>
            {!userProfile ? (
              <>
                <Link href="/login">
                  <a
                    className="text-slate-200 hover:text-cyan-400"
                    data-test-id="login"
                  >
                    Login
                  </a>
                </Link>
                <Link href="/registration">
                  <a
                    className="bg-cyan-500 py-[0.2em] rounded-full font-bold tracking-wider text-gray-800 self-center px-[.6em] scale-100 duration-200 ease-in hover:scale-110 hover:bg-cyan-400 focus:scale-105 focus:bg-cyan-400 cursor-pointer"
                    data-test-id="register"
                  >
                    Register
                  </a>
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
                <Anchor
                  href="/logout"
                  className="text-slate-200 hover:text-cyan-400"
                >
                  Logout
                </Anchor>
              </>
            )}
          </div>
          {isMenuOpen ? (
            <button
              onClick={() => setIsMenuOpen((prevState) => !prevState)}
              className="absolute pr-4 right-0  "
            >
              <XIcon width={25} height={25} />
            </button>
          ) : (
            <button
              onClick={() => setIsMenuOpen((prevState) => !prevState)}
              className="md:hidden block absolute right-0 mr-4 "
            >
              <MenuIcon width={25} height={25} />
            </button>
          )}
        </nav>
      </header>
      {props.children}
    </>
  );
}
