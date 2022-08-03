import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ResponseBody } from './api/register';
import { UserInput } from './registration';

export default function Login() {
  const [loginError, setLoginError] = useState('');
  const {
    handleSubmit,
    register,
    formState: { errors },
    trigger,
  } = useForm<UserInput>();

  const router = useRouter();
  async function handleUserLogin(userInput: UserInput) {
    const isUserInputValid = await trigger();
    if (isUserInputValid) {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userInput.username,
          password: userInput.password,
        }),
      });
      const data: ResponseBody = await response.json();
      if ('error' in data) {
        setLoginError(data.error[0].message);
        return;
      }

      const returnTo = router.query.returnTo;
      if (
        returnTo &&
        !Array.isArray(returnTo) &&
        /^\/[a-zA-Z0-9-?=/]*$/.test(returnTo)
      ) {
        await router.push(returnTo);
      } else {
        await router.push('/stories');
      }
    }
  }
  return (
    <>
      <Head>
        <title>Login</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center">
        <form onSubmit={handleSubmit(handleUserLogin)}>
          <h1 className="text-cyan-300 text-3xl font-bold tracking-wider">
            Login
          </h1>
          <div className="flex flex-col justify-center items-center mt-12 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-col justify-center items-center space-y-2">
                <label
                  htmlFor="username"
                  className="font-bold text-lg tracking-wider text-slate-200"
                >
                  Username
                </label>
                <input
                  {...register('username', {
                    required: {
                      value: true,
                      message: 'This field is required',
                    },
                  })}
                  data-test-id="loginUsername"
                  id="username"
                />
                {errors.username ? (
                  <p
                    className="font-bold tracking-wide text-sm text-red-200"
                    date-test-id="loginUsernameError"
                  >
                    {errors.username.message}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col justify-center items-center space-y-3">
                <label
                  htmlFor="password"
                  className="font-bold text-lg tracking-wider text-slate-200"
                >
                  Password
                </label>
                <input
                  {...register('password', {
                    required: {
                      value: true,
                      message: 'This field is required',
                    },
                  })}
                  id="password"
                  type="password"
                  data-test-id="loginPassword"
                />
                {errors.password ? (
                  <p
                    className="font-bold tracking-wide text-sm text-red-300"
                    data-test-id="loginPasswordError"
                  >
                    {errors.password.message}
                  </p>
                ) : null}
                {loginError.length > 0 ? (
                  <p
                    className="font-bold tracking-wide text-sm text-red-300"
                    data-test-id="loginServerResponseError"
                  >
                    {loginError}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <button
                className="bg-cyan-400 py-[0.4em] mb-3 px-[1.2em] rounded-full font-bold tracking-wider self-center scale-100 duration-200 ease-in hover:scale-110 hover:bg-cyan-800 hover:text-slate-100 focus:scale-105 focus:bg-cyan-800 cursor-pointer"
                data-test-id="loginButton"
              >
                Login
              </button>
              <div className="text-lg font-m text-center flex flex-col justify-center items-center space-y-3 text-slate-300">
                <p>Don't have an account?</p>
                <Link href="/registration">
                  <a className="bg-cyan-800 px-[1.2em] py-[0.2em] text-slate-200 font-bold rounded-full tracking-wider self-center scale-100 duration-200 ease-in hover:scale-110 hover:text-[#1c1c1c] hover:bg-cyan-400 focus:scale-105 focus:bg-cyan-400 cursor-pointer">
                    Register
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
