import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { type NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import { getServerAuthSession } from '@/server/auth';

interface Params {
  params: {
    article: number;
  };
}

export async function POST(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const session = await getServerAuthSession();

  if (!session?.user) {
    return NextResponse.json(
      { error: 'unauthorized' },
      { status: 401 },
    );
  }

  const { user } = session;

  const articleQ = await sql<{ content_url: string | null }>`
    SELECT id
    FROM articles
    WHERE user_id = ${user.id} AND id = ${params.article}`;

  if (articleQ.rows.length === 0) {
    return NextResponse.json(
      { error: 'No article found' },
      { status: 400 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
          tokenPayload: JSON.stringify({
            user: user.id,
            article: params.article,
          }),
        };
      },
      onUploadCompleted: async () => {
        console.log('image blob upload completed');
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
