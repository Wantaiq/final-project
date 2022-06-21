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
      const response = await fetch('http://localhost:3000/api/register', {
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
        await router.push('/login');
      }
    }
  }
  return (
    <form onSubmit={handleSubmit(handleUserRegistration)}>
      <label htmlFor="username">Username</label>
      <input
        id="username"
        {...register('username', {
          required: {
            value: true,
            message: 'This field is required',
          },
          minLength: {
            value: 2,
            message: 'Minimum number of characters is 2',
          },
        })}
      />
      {errors.username ? <p>{errors.username.message}</p> : null}
      <label htmlFor="password">Password</label>
      <input
        id="password"
        {...register('password', {
          required: {
            value: true,
            message: 'This field is required',
          },
          minLength: {
            value: 5,
            message: 'Minimum number of characters is 5',
          },
        })}
      />
      {errors.password ? <p>{errors.password.message}</p> : null}
      {registrationError.length > 0 ? <p>{registrationError}</p> : null}
      <button>Register</button>
    </form>
  );
}
