import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ResponseBody } from './api/register';

export type UserInput = {
  username: string;
  password: string;
};
export default function Register() {
  const [registrationError, setRegistrationError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<UserInput>();
  const router = useRouter();
  async function handleUserRegistration(userInput: UserInput) {
    const isUserInputValid = await trigger();
    if (isUserInputValid) {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userInput.username,
          password: userInput.password,
        }),
      });
      const data: ResponseBody = await response.json();
      if ('error' in data) {
        setRegistrationError(data.error[0].message);
      } else {
        setRegistrationError('');
        await router.push('/profile');
      }
    }
  }
  return (
    <>
      <Head>
        <title>Register</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center">
        <form onSubmit={handleSubmit(handleUserRegistration)}>
          <h1 className="text-cyan-400 text-3xl font-bold tracking-wider ">
            Register
          </h1>
          <div className="flex flex-col justify-center items-center mx-auto mt-12 space-y-6">
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
                  minLength: {
                    value: 2,
                    message: 'Please choose username longer than 2 characters',
                  },
                  pattern: {
                    value: /^[a-zA-Z-0-9-!?:;'"()_,. ]*$/gm,
                    message: `Letters, numbers and !?:;'"()_- characters are allowed`,
                  },
                })}
                id="username"
                data-test-id="registrationUsername"
              />
              {errors.username ? (
                <p
                  className="font-bold tracking-wide text-sm text-red-300"
                  data-test-id="registrationUsernameError"
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
                  minLength: {
                    value: 5,
                    message: 'Please choose password longer than 5 characters',
                  },
                })}
                id="password"
                type="password"
                data-test-id="registrationPassword"
              />
              {errors.password ? (
                <p
                  className="font-bold tracking-wide text-sm text-red-300"
                  data-test-id="registrationPasswordError"
                >
                  {errors.password.message}
                </p>
              ) : null}
              {registrationError.length > 0 ? (
                <p className="font-bold tracking-wide text-sm text-red-300">
                  {registrationError}
                </p>
              ) : null}
            </div>
            <button
              className="bg-cyan-400 py-[0.5em] rounded-full font-bold tracking-wider self-center px-[1.4em] scale-100 duration-200 ease-in hover:scale-110 hover:bg-cyan-800 hover:text-slate-100 focus:scale-105 focus:bg-cyan-800 cursor-pointer"
              data-test-id="registrationButton"
            >
              Register
            </button>
            <div className="text-lg font-m text-center flex flex-col justify-center items-center text-slate-300">
              <p>Already have an account?</p>
              <Link href="/login">
                <a className="bg-cyan-800 px-[1.2em] mt-2 py-[0.2em] text-slate-200 font-bold rounded-full tracking-wider self-center scale-100 duration-200 ease-in hover:scale-110 hover:text-[#1c1c1c] hover:bg-cyan-400 focus:scale-105 focus:bg-cyan-400 cursor-pointer">
                  Login
                </a>
              </Link>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}
