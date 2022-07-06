import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ResponseBody } from './api/register';
import { UserInput } from './register';

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
        await router.push('/profile');
      }
    }
  }
  return (
    <form
      onSubmit={handleSubmit(handleUserLogin)}
      className="flex justify-center h-[40%] items-center"
    >
      <div className="space-y-8 flex flex-col justify-center items-center">
        <div className="flex flex-col w-fit justify-center items-center space-y-3">
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
            })}
            id="username"
          />
          {errors.username ? (
            <p className="font-bold tracking-wide text-sm text-red-300">
              {errors.username.message}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col w-fit justify-center items-center space-y-3">
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
            })}
            id="password"
            type="password"
          />
          {errors.password ? (
            <p className="font-bold tracking-wide text-sm text-red-300">
              {errors.password.message}
            </p>
          ) : null}
          {loginError.length > 0 ? (
            <p className="font-bold tracking-wide text-sm text-red-300">
              {loginError}
            </p>
          ) : null}
        </div>
        <div>
          <button className="bg-amber-600 py-[0.4em] px-[1.5em] rounded font-medium text-lg tracking-wider">
            Login
          </button>
        </div>
      </div>
    </form>
  );
}
