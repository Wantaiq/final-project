import Head from 'next/head';
import Link from 'next/link';
import { useContext, useEffect } from 'react';
import { profileContext } from '../context/ProfileProvider';

export default function Home() {
  const { handleUserProfile } = useContext(profileContext);
  useEffect(() => {
    handleUserProfile();
  }, [handleUserProfile]);
  return (
    <>
      <Head>
        <title>Qualia</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="w-full h-full mx-auto flex justify-center items-center bg-ink-blot bg-no-repeat bg-center bg-[length:1100px]">
        <div className="flex flex-col mb-28">
          <div>
            <h1 className="text-[3rem] font-semibold tracking-wider text-cyan-500">
              Qualia
            </h1>
            <p className="text-[1.8em] text-amber-600 italic">
              Where inspiration lives
            </p>
            <div className="mt-10">
              <div className="flex flex-col space-y-4 items-center">
                <p className="text-lg text-cyan-500">Are you a writer?</p>
                <Link href="/register">
                  <a className="bg-cyan-500 py-[0.5em] rounded-full font-bold tracking-wider self-center px-[1.4em] scale-100 duration-200 ease-in hover:scale-110 hover:bg-cyan-400 focus:scale-105 focus:bg-cyan-400 cursor-pointer">
                    Register
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
