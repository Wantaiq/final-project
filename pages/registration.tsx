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
    <div className="mx-auto bg-ink-light bg-[bottom_left_1150px] bg-[length:1600px] w-full h-full bg-no-repeat">
      <main className="py-32">
        <div className="flex justify-center">
          <h1 className="text-cyan-400 text-3xl font-bold tracking-wider ">
            Register
          </h1>
          <form
            onSubmit={handleSubmit(handleUserRegistration)}
            className="flex justify-center h-[40%] items-center"
          >
            <div className="flex flex-col justify-center items-center mx-auto my-24 py-10 px-20 space-y-4">
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
                      minLength: {
                        value: 2,
                        message:
                          'Please choose username longer than 2 characters',
                      },
                    })}
                    id="username"
                  />
                  {errors.username ? (
                    <p className="font-bold tracking-wide text-sm text-red-300">
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
                        message:
                          'Please choose password longer than 5 characters',
                      },
                    })}
                    id="password"
                    type="password"
                  />
                  {errors.password ? (
                    <p className="font-bold tracking-wide text-sm text-red-300">
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
              <button className="bg-cyan-400 py-[0.5em] rounded-full font-bold tracking-wider self-center px-[1.4em] scale-100 duration-200 ease-in hover:scale-110 hover:bg-cyan-800 hover:text-slate-100 focus:scale-105 focus:bg-cyan-800 cursor-pointer">
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
        </div>
      </main>
    </div>
  );
}
