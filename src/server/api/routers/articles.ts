import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const articlesRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      folder: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const articlesQ = await sql<{ id: number; title: string; created_at: Date; updated_at: Date }>`
      SELECT id, title, created_at, updated_at
      FROM articles
      WHERE folder_id = ${input.folder} AND user_id = ${userId}
      ORDER BY created_at`;

      return articlesQ.rows;
    }),

  create: protectedProcedure.input(z.object({
    name: z.string().min(1, 'Please provide a name'),
    folder: z.number(),
  })).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    const response = await sql<{ id: number }>`
      INSERT INTO articles (title, folder_id, user_id)
      VALUES (${input.name}, ${input.folder}, ${userId})
      RETURNING id`;

    return response.rows[0]!.id;
  }),

  getContent: protectedProcedure
    .input(z.object({
      article: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const articleQ = await sql<{ content_url: string | null }>`
        SELECT content_url FROM articles WHERE user_id = ${userId} AND id = ${input.article}`;

      const article = articleQ.rows[0];

      if (!article) {
        throw new Error('Could not find the article referenced');
      }

      if (!article.content_url) {
        return '';
      }

      const contentReq = await fetch(article.content_url);

      if (!contentReq.ok) {
        throw new Error('Could not load the content of the article');
      }

      return contentReq.json();
    }),

  updateContent: protectedProcedure
    .input(z.object({
      article: z.number(),
      content_url: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const response = await sql<{ id: number }>`
        UPDATE articles
          SET content_url = ${input.content_url},
              updated_at = ${(new Date()).toLocaleString()}
        WHERE user_id = ${userId} AND id = ${input.article}
        RETURNING id;`;

      return !!response.rows[0]?.id;
    })
});
