import { object, string } from 'yup';

const authenticationSchema = object({
  username: string().required().min(2),
  password: string().required().min(5),
});

export { authenticationSchema };
