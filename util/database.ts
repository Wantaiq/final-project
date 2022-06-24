import camelcaseKeys from 'camelcase-keys';
import { config } from 'dotenv-safe';
import postgres from 'postgres';

config();

declare module globalThis {
  let postgresSqlClient: ReturnType<typeof postgres> | undefined;
}
function connectOneTimeToDatabase() {
  let sql;
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    sql = postgres({ ssl: { rejectUnauthorized: false } });
  } else {
    if (!globalThis.postgresSqlClient) {
      globalThis.postgresSqlClient = postgres();
    }
    sql = globalThis.postgresSqlClient;
  }
  return sql;
}

const sql = connectOneTimeToDatabase();
export default sql;

export type User = {
  id: number;
  username: string;
};

export type UserProfile = {
  bio: string | null;
  username: string;
  userId: number;
};

export type UserStory = {
  id: number;
  title: string;
  chapterOne: string;
  chapterTwo: string;
  chapterThree: string;
  chapterFour: string;
  chapterFive: string;
  chapterSix: string;
};

type Seed = {
  csrfSeed: string;
};

type UserId = {
  id: number;
};

type UserWithHashedPassword = User & {
  password: string;
};

export type Session = {
  id: number;
  token: string;
};

type DeletedStory = {
  id: number;
};

export async function createUserWithHashedPassword(
  username: string,
  hashedPassword: string,
) {
  const [user] = await sql<[User]>`
    INSERT INTO users(username, password)
    VALUES(${username}, ${hashedPassword})
    RETURNING id,username`;
  return camelcaseKeys(user);
}

export async function getUserByUsername(username: string) {
  if (!username) return undefined;
  const [user] = await sql<[User | undefined]>`SELECT username
    from users
    WHERE username = ${username}`;
  return user && camelcaseKeys(user);
}

export async function getUserWithHashedPassword(username: string) {
  if (!username) return undefined;
  const [user] = await sql<[UserWithHashedPassword]>`
  SELECT *
  FROM users
  where username = ${username}
  `;
  return camelcaseKeys(user);
}

export async function createUserProfile(userId: number) {
  const [userProfile] = await sql<[UserProfile]>`
  INSERT INTO user_profiles(user_id)
    VALUES(${userId})
    RETURNING bio, user_id
    `;
  return camelcaseKeys(userProfile);
}

export async function createSession(
  token: string,
  userId: number,
  csrfSeed: string,
) {
  const [session] = await sql<[Session]>`
  INSERT INTO sessions (token, user_id, csrf_seed)
  VALUES(${token}, ${userId}, ${csrfSeed})
  RETURNING id, token
  `;
  await deleteExpiredSession();
  return camelcaseKeys(session);
}

export async function deleteExpiredSession() {
  const sessions = await sql`
  DELETE FROM sessions WHERE expiry_timestamp < now()`;
  return sessions.map((session) => camelcaseKeys(session));
}

export async function deleteSessionByToken(token: string) {
  const [session] = await sql<[Session | undefined]>`
  DELETE FROM sessions WHERE token = ${token}
  RETURNING *`;
  return session && camelcaseKeys(session);
}

export async function getUserIdByUsername(username: string) {
  const [userId] = await sql<
    [UserId]
  >`SELECT id FROM users WHERE username = ${username}`;
  return camelcaseKeys(userId);
}
export async function getUserProfileByUserId(userId: number) {
  const [userProfile] = await sql<[UserProfile]>`
    SELECT users.username, user_profiles.bio, user_profiles.user_id
    FROM users, user_profiles
    WHERE users.id = ${userId}
    AND users.id = user_profiles.id`;
  return camelcaseKeys(userProfile);
}

export async function getUserProfileByValidSessionToken(token: string) {
  if (!token) return undefined;
  const [user] = await sql<[UserProfile]>`
  SELECT users.username, user_profiles.bio, user_profiles.user_id
  FROM users, user_profiles, sessions
  WHERE sessions.token = ${token}
  AND sessions.expiry_timestamp > now()
  AND sessions.user_id = user_profiles.id
  AND sessions.user_id = users.id
  `;
  await deleteExpiredSession();
  return camelcaseKeys(user);
}

export async function getUserStoriesByUserId(userId: number) {
  const stories = await sql<
    [UserStory]
  >`SELECT id, title, chapter_one, chapter_two, chapter_three, chapter_four, chapter_five, chapter_six FROM stories WHERE user_id = ${userId}`;
  console.log(stories);
  return stories;
}

export async function createUserStory(
  title: string,
  chapterOne: string,
  chapterTwo: string,
  chapterThree: string,
  chapterFour: string,
  chapterFive: string,
  chapterSix: string,
  userId: number,
) {
  try {
    const [newStory] = await sql<
      [UserStory]
    >`INSERT INTO stories (title, chapter_one, chapter_two, chapter_three,chapter_four, chapter_five, chapter_six ,user_id) VALUES(${title}, ${chapterOne},${chapterTwo}, ${chapterThree}, ${chapterFour},${chapterFive}, ${chapterSix}, ${userId}) RETURNING id, title, chapter_one, chapter_two, chapter_three, chapter_four, chapter_five, chapter_six, user_id`;
    return camelcaseKeys(newStory);
  } catch (error) {
    console.log(error);
  }
}

export async function deleteStory(storyId: number) {
  const [deletedStory] = await sql<[DeletedStory]>`
  DELETE FROM stories where id = ${storyId} RETURNING id`;
  return camelcaseKeys(deletedStory);
}

export async function getCsrfSeedByValidUserToken(token: string) {
  const [seed] = await sql<
    [Seed]
  >`SELECT csrf_seed FROM sessions WHERE token = ${token}`;
  return camelcaseKeys(seed);
}
