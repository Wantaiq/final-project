import Image from 'next/image';
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
        await router.push('/');
      }
    }
  }
  return (
    <div className="bg-ink-splatter bg-no-repeat bg-[top_right_470px] bg-cover w-full h-full mt-32">
      <form
        onSubmit={handleSubmit(handleUserRegistration)}
        className="flex justify-center h-[40%] items-center"
      >
        <div className="flex flex-col justify-center items-center mx-auto my-24 py-10 px-20 space-y-4">
          <div className="space-y-3">
            <div className="flex flex-col justify-center items-center space-y-2">
              <label
                htmlFor="username"
                className="font-bold text-lg tracking-wider"
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
                })}
                id="username"
              />
              {errors.username ? (
                <p className="font-bold tracking-wide text-sm text-red-500">
                  {errors.username.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col justify-center items-center space-y-3">
              <label
                htmlFor="password"
                className="font-bold text-lg tracking-wider"
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
              />
              {errors.password ? (
                <p className="font-bold tracking-wide text-sm text-red-500">
                  {errors.password.message}
                </p>
              ) : null}
              {registrationError.length > 0 ? (
                <p className="font-bold tracking-wide text-sm text-red-300">
                  {registrationError}
                </p>
              ) : null}
            </div>
          </div>
          <button className="p-8 font-bold text-xl bg-ink bg-[length:160px] bg-center flex items-center bg-no-repeat text-slate-100 transition-all scale-100 duration-200 ease-in hover:bg-[length:170px] hover:scale-110 focus:bg-[length:170px] focus:scale-110">
            Register
          </button>
          <div className="text-lg font-m text-center flex flex-col justify-center items-center">
            <p>Already have an account?</p>
            <Link href="/login">
              <a className="p-8 font-bold bg-ink bg-[length:140px] bg-center flex items-center bg-no-repeat text-slate-100 transition-all scale-100 duration-200 ease-in hover:bg-[length:150px] hover:scale-110 focus:bg-[length:150px] focus:scale-110">
                Login
              </a>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
