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
    <form
      onSubmit={handleSubmit(handleUserRegistration)}
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
              minLength: {
                value: 2,
                message: 'Please choose username longer than 2 characters',
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
              minLength: {
                value: 5,
                message: 'Please choose password longer than 5 characters',
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
        <div>
          <button className="bg-amber-600 py-[0.4em] px-[1.5em] rounded font-medium text-lg tracking-wider">
            Register
          </button>
        </div>
      </div>
    </form>
  );
}
