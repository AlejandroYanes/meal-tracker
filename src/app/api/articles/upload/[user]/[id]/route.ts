import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { type NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { del } from '@vercel/blob';

import { getServerAuthSession } from '@/server/auth';

interface Params {
  params: {
    user: number;
    id: number;
  };
}

export async function POST(request: NextRequest, params: Params): Promise<NextResponse> {
  const session = await getServerAuthSession();

  if (!session) {
    return NextResponse.json(
      { error: 'unauthorized' },
      { status: 401 },
    );
  }

  const articleQ = await sql<{ content_url: string | null }>`
    SELECT content_url
    FROM articles
    WHERE user_id = ${params.params.user} AND id = ${params.params.id}`;

  const { content_url } = articleQ.rows[0]!;

  if (content_url) {
    await del(content_url);
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ['application/json'],
          tokenPayload: JSON.stringify({
            user: params.params.user,
            article: params.params.id,
          }),
        };
      },
      onUploadCompleted: async () => {
        console.log('article blob upload completed');
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
  }
}
