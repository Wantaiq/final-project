import camelcaseKeys from 'camelcase-keys';
import { config } from 'dotenv-safe';
import postgres from 'postgres';
import setPostgresDefaultsOnHeroku from './setPostgresDefaultsOnHeroku';

setPostgresDefaultsOnHeroku();

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

export type UserStory = {
  id: number;
  title: string;
  description: string;
  coverImgUrl: string;
  category: string;
};

export type Chapters = {
  id: number;
  title: string;
  heading: string;
  content: string;
  chapterNumber: number;
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

export type AllStories = {
  id: number;
  username: string;
  title: string;
  coverImgUrl: string;
  category: string;
  description: string;
}[];

type DeletedStory = {
  id: number;
};

type StoryId = {
  storyId: number;
};

export type Comments = {
  id: number;
  content: string;
  username: string;
  profileAvatarUrl: string;
}[];

export type StoryOverview = {
  id: number;
  avatar: string;
  storyId: number;
  author: string;
  title: string;
  description: string;
  coverImgUrl: string;
  numberOfChapters: number;
};

export type FavoriteStories = {
  userId: number;
  storyId: number;
  author: string;
  title: string;
  description: string;
  category: string;
  coverImgUrl: string;
}[];
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
    VALUES(${userId}, 'https://res.cloudinary.com/dxbam2d2r/image/upload/v1658480225/avatars/zyi3w247idihrh4qdwt1.jpg')
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
  coverImgUrl: string,
  category: string,
) {
  const [story] =
    await sql`INSERT INTO stories (title, description, category, user_id, cover_img_url)VALUES (${title}, ${description}, ${category}, ${userId}, ${coverImgUrl}) RETURNING id, title, description `;
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
  const stories = await sql<
    [AllStories]
  >`SELECT stories.id, users.username, stories.title, stories.cover_img_url, stories.category, stories.description
    FROM users, stories
    WHERE users.id = stories.user_id
    ORDER BY stories.id DESC`;
  return camelcaseKeys(stories);
}

export async function getAllUserStoriesByUserId(userId: number) {
  const stories =
    await sql`SELECT id, title, description, category, cover_img_url
    FROM stories
    WHERE user_id = ${userId}
    ORDER BY id DESC`;
  return camelcaseKeys(stories);
}

export async function getAllStoryChaptersByStoryId(storyId: number) {
  if (isNaN(storyId)) return [];
  const chapters = await sql<
    [Chapters]
  >`SELECT chapters.id, stories.title, chapters.heading, chapters.content, chapters.sort_position as chapter_number
    FROM stories, chapters
    WHERE stories.id= ${storyId}
    AND chapters.story_id = stories.id
    ORDER BY chapters.sort_position ASC
    `;
  return chapters.map((chapter) => camelcaseKeys(chapter));
}

export async function getAllStoryChapterTitlesByStoryId(storyId: number) {
  if (isNaN(storyId)) return;
  const chapterTitles =
    await sql`SELECT heading, sort_position AS chapter_number FROM chapters WHERE story_id = ${storyId} ORDER BY sort_position ASC`;
  return chapterTitles.map((title) => camelcaseKeys(title));
}

export async function getStoryOverviewByStoryId(storyId: number) {
  if (!storyId) return;
  const [overview] = await sql<
    [StoryOverview | undefined]
  >`SELECT stories.id as story_id, users.username as author, stories.title, stories.description, stories.cover_img_url, user_profiles.profile_avatar_url AS avatar, MAX(chapters.sort_position) as number_of_chapters
    FROM users, stories, chapters, user_profiles
    WHERE stories.id = ${storyId}
    AND stories.user_id = users.id
    AND stories.id = chapters.story_id
    AND user_profiles.id = users.id
    GROUP BY stories.id, users.username, stories.title, stories.description, user_profiles.profile_avatar_url
    `;
  return !overview ? undefined : camelcaseKeys(overview);
}

export async function getAuthorProfileByStoryId(storyId: number) {
  if (isNaN(storyId)) return;
  const [profile] =
    await sql`SELECT users.username, user_profiles.profile_avatar_url as avatar, user_profiles.bio
    FROM users, user_profiles, stories
    WHERE stories.id = ${storyId}
    AND stories.user_id = users.id
    AND users.id = user_profiles.id`;
  return profile;
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
  if (!storyId) return;
  const comments = await sql<
    [Comments]
  >`SELECT comments.id, comments.content, users.username, user_profiles.profile_avatar_url
    FROM comments, users, stories, user_profiles
    WHERE comments.story_id = ${storyId}
    AND users.id = comments.creator_id
    AND comments.story_id = stories.id
    AND user_profiles.user_id = users.id
    ORDER BY comments.id DESC
    `;
  return comments.map((comment) => camelcaseKeys(comment));
}

export async function deleteStory(storyId: number) {
  const [deletedStory] = await sql<[DeletedStory]>`
  DELETE FROM stories where id = ${storyId} RETURNING id`;
  return camelcaseKeys(deletedStory);
}

export async function favoriteStory(storyId: number, userId: number) {
  const [favorite] = await sql`INSERT INTO favorites(story_id, user_id)
  VALUES(${storyId}, ${userId}) RETURNING * `;
  return camelcaseKeys(favorite);
}

export async function isStoryFavorite(storyId: number, userId: number) {
  const [favorite] = await sql<[StoryId | undefined]>`
  SELECT favorites.story_id
    FROM favorites
    WHERE favorites.story_id = ${storyId}
    AND favorites.user_id = ${userId}
    `;
  return favorite ? true : false;
}

export async function removeFromFavorites(storyId: number, userId: number) {
  const [removedFavoriteStory] = await sql<[StoryId]>`
  DELETE FROM favorites
  WHERE favorites.story_id = ${storyId}
  AND favorites.user_id = ${userId} RETURNING favorites.story_id`;
  return camelcaseKeys(removedFavoriteStory);
}

export async function getAllFavoriteStoriesByUserId(userId: number) {
  const favorites = await sql<
    [FavoriteStories]
  >`SELECT users.id as userId, stories.id as story_id, users.username as author, stories.title, stories.description, stories.cover_img_url, stories.category
    FROM favorites, stories, users
    WHERE users.id = ${userId}
    AND favorites.user_id = users.id
    AND favorites.story_id = stories.id`;
  return favorites.map((story) => camelcaseKeys(story));
}
export async function getCsrfSeedByValidUserToken(token: string) {
  const [seed] = await sql<
    [Seed]
  >`SELECT csrf_seed FROM sessions WHERE token = ${token}`;
  return camelcaseKeys(seed);
}
