import cookie from 'cookie';

export function createSerializedCookie(token: string) {
  const cookieMaxAge = 60 * 60 * 24;

  return cookie.serialize('sessionToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
    maxAge: cookieMaxAge,
    expires: new Date(Date.now() + cookieMaxAge * 1000),
    path: '/',
  });
}
