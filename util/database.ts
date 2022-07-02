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
  avatar: string;
  username: string;
  userId: number;
};

export type UserComments = {
  id: number;
  storyId: number;
  storyTitle: string;
  content: string;
}[];

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

export type Comments = {
  id: number;
  content: string;
  username: string;
}[];

export type StoryOverview = {
  id: number;
  storyId: number;
  author: string;
  title: string;
  description: string;
  numberOfChapters: number;
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
  INSERT INTO user_profiles(user_id, profile_avatar_url)
    VALUES(${userId}, 'https://res.cloudinary.com/dxbam2d2r/image/upload/v1656662127/avatars/three-dogs.jpg')
    RETURNING bio, user_id
    `;
  return camelcaseKeys(userProfile);
}

export async function updateUserProfileAvatar(img: string, userId: number) {
  const [newUserProfile] =
    await sql`UPDATE user_profiles SET profile_avatar_url = ${img} WHERE user_id = ${userId} RETURNING *`;
  return camelcaseKeys(newUserProfile);
}

export async function updateUserProfileBio(bio: string, userId: number) {
  const [newUserProfile] =
    await sql`UPDATE user_profiles SET bio = ${bio} WHERE user_id = ${userId} RETURNING *`;
  return camelcaseKeys(newUserProfile);
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
    await sql`SELECT users.id, users.username, user_profiles.profile_avatar_url as avatar,user_profiles.bio, user_profiles.user_id
  FROM users, user_profiles
  WHERE users.username = ${username}
  AND user_profiles.user_id = users.id`;
  return camelcaseKeys(userProfile);
}

export async function getCurrentUserIdBySessionToken(token: string) {
  if (!token) return undefined;
  const [userId] =
    await sql`SELECT users.id from users, sessions WHERE sessions.token=${token} AND sessions.user_id = users.id`;
  return userId;
}

export async function getUserProfileByValidSessionToken(token: string) {
  if (!token) return undefined;
  const [user] = await sql<[UserProfile]>`
  SELECT users.id as user_id, users.username, user_profiles.profile_avatar_url as avatar,user_profiles.bio
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
  return camelcaseKeys(storyChapter);
}

export async function getAllStories() {
  const stories =
    await sql`SELECT stories.id, users.username, stories.title, stories.description
    FROM users, stories
    WHERE users.id = stories.user_id
    ORDER BY stories.id DESC`;
  return camelcaseKeys(stories);
}

export async function getAllUserStoriesByUserId(userId: number) {
  const stories = await sql`SELECT id, title, description
    FROM stories
    WHERE user_id = ${userId}
    ORDER BY id DESC`;
  return camelcaseKeys(stories);
}

export async function getAllStoryChaptersByStoryId(storyId: number) {
  const chapters =
    await sql`SELECT chapters.id, stories.title, chapters.heading, chapters.content
    FROM stories, chapters
    WHERE stories.id= ${storyId}
    AND chapters.story_id = stories.id
    ORDER BY chapters.sort_position ASC
    `;
  return chapters.map((chapter) => camelcaseKeys(chapter));
}
export async function getStoryOverviewByStoryId(storyId: number) {
  const [overview] = await sql<
    [StoryOverview | undefined]
  >`SELECT stories.id as story_id, users.username as author, stories.title, stories.description, MAX(chapters.sort_position) as number_of_chapters
    FROM users, stories, chapters
    WHERE stories.id = ${storyId}
    AND stories.user_id = users.id
    AND stories.id = chapters.story_id
    GROUP BY stories.id, users.username, stories.title, stories.description
    `;
  return !overview ? undefined : camelcaseKeys(overview);
}

export async function createNewComment(
  storyId: number,
  userId: number,
  content: string,
) {
  const [comment] = await sql`
  INSERT INTO comments(story_id, creator_id, content)
  VALUES(${storyId}, ${userId}, ${content})
  RETURNING id, content`;
  return camelcaseKeys(comment);
}

export async function deleteComment(commentId: number) {
  const [deletedComment] = await sql`DELETE FROM comments
    WHERE id=${commentId}
    RETURNING id
    `;
  return camelcaseKeys(deletedComment);
}

export async function getAllStoryCommentsByStoryId(storyId: number) {
  const comments = await sql<
    [Comments]
  >`SELECT comments.id, comments.content, users.username
    FROM comments, users, stories
    WHERE comments.story_id = ${storyId}
    AND users.id = comments.creator_id
    AND comments.story_id = stories.id
    ORDER BY comments.id DESC
    `;
  return comments.map((comment) => camelcaseKeys(comment));
}

export async function getAllUsersCommentsByUserId(userId: number) {
  const comments = await sql<
    [UserComments]
  >`SELECT comments.id, stories.id as story_id, stories.title as story_title, comments.content
    FROM comments, stories
    WHERE comments.creator_id = ${userId}
    AND stories.id = comments.story_id
    ORDER BY comments.id DESC
    `;
  return comments.map((comment) => camelcaseKeys(comment));
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
