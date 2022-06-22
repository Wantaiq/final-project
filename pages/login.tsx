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
      const response = await fetch('http://localhost:3000/api/login', {
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
        await router.push('/');
      }
    }
  }
  return (
    <form onSubmit={handleSubmit(handleUserLogin)}>
      <label htmlFor="username">Username</label>
      <input
        {...register('username', {
          required: {
            value: true,
            message: 'This field is required',
          },
        })}
        id="username"
      />
      {errors.username ? <p>{errors.username.message}</p> : null}
      <label htmlFor="password">Password</label>
      <input
        {...register('password', {
          required: {
            value: true,
            message: 'This field is required',
          },
        })}
        id="password"
      />
      {errors.password ? <p>{errors.password.message}</p> : null}
      {loginError.length > 0 ? <p>{loginError}</p> : null}
      <button>Login</button>
    </form>
  );
}
