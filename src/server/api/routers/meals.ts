import { sql } from '@vercel/postgres';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const mealsRouter = createTRPCRouter({
  list: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;

      const mealsQ = await sql<{ id: number; name: string; carbs_goal: number; proteins_goal: number; fats_goal: number }>`
        SELECT id, name, carbs_goal, proteins_goal, fats_goal FROM meals WHERE user_id = ${userId}`;
      return mealsQ.rows;
    }),
});
