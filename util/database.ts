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
  description: string;
};

type Seed = {
  csrfSeed: string;
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

export async function getUserProfileByUsername(username: string) {
  if (!username) return undefined;
  const [userProfile] =
    await sql`SELECT users.id, users.username, user_profiles.bio
  FROM users, user_profiles
  WHERE users.username = ${username}
  AND user_profiles.user_id = users.id`;
  console.log(userProfile);
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

export async function createUserStory(
  title: string,
  description: string,
  userId: string,
) {
  const [story] =
    await sql`INSERT INTO stories (title, description, user_id)VALUES (${title}, ${description}, ${userId}) RETURNING id, title, description `;
  return camelcaseKeys(story);
}

export async function createChapter(
  storyId: number,
  heading: string,
  content: string,
  sortPosition: number,
) {
  const [storyChapter] =
    await sql`INSERT INTO chapters (story_id, heading, content, sort_position) VALUES(${storyId},${heading}, ${content}, ${sortPosition})
    RETURNING * `;
  console.log(storyChapter);
  return camelcaseKeys(storyChapter);
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
