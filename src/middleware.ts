import { type NextRequest, NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import { sql } from '@hr-hub/helpers';

export const config = {
  matcher: ['/f/:token'],
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const parts = pathname.split('/');
  const token = parts.at(-1);

  // const __cookies = await cookies();
  // const sessionCookie = __cookies.get('authjs.session-token');
  const sessionCookie = request.cookies.get('authjs.session-token');

  if (!token) {
    return NextResponse.redirect(new URL('/not-allowed', request.url));
  }

  if (token.startsWith('private_') && !sessionCookie) {
    return NextResponse.redirect(new URL('/not-allowed', request.url));
  }

  return NextResponse.redirect(new URL('/not-allowed?middleware=ok', request.url));

  // const query = await sql<{ file_url: string }>`
  //   SELECT file_url FROM user_files WHERE public_token = ${token} OR private_token = ${token}`;
  //
  // const file = query.rows[0];
  // if (!file) {
  //   return NextResponse.redirect(new URL('/not-allowed', request.url));
  // }
  //
  // return NextResponse.rewrite(file.file_url);
}
