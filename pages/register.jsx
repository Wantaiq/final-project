import { useRouter } from 'next/router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function Register() {
  const [registrationError, setRegistrationError] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm();
  const router = useRouter();
  async function handleUserRegistration(userInput) {
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
      const data = await response.json();
      if ('errors' in data) {
        setRegistrationError(data.errors[0].message);
      } else {
        setRegistrationError([]);
        await router.push('/');
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
