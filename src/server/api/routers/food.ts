import { z } from 'zod';
import { sql } from '@vercel/postgres';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { tql } from '@/utils/tql';

export const foodRouter = createTRPCRouter({
  list: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const foodQ = await sql<{
        id: number;
        name: string;
        description: string;
        notes: string;
        amount: number;
        unit: string;
        price: number;
        carbs: number;
        proteins: number;
        fats: number;
      }>`
        SELECT id, name, description, notes, amount, unit, price, carbs, proteins, fats
        FROM food
        WHERE user_id = ${userId} AND is_hidden = false`;

      return foodQ.rows;
    }),

  add: protectedProcedure
    .input(z.object({
      name: z.string().min(1, 'Please add a name'),
      description: z.string(),
      notes: z.string(),
      amount: z.number().min(1, 'Please add an amount'),
      unit: z.string().min(1, 'Please add a unit'),
      price: z.number(),
      carbs: z.number().min(0).max(1),
      proteins: z.number().min(0).max(1),
      fats: z.number().min(0).max(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const [insertQ, insertP] = tql.query`INSERT INTO food ${tql.VALUES({ ...input, user_id: userId })}`;
      await sql.query(insertQ, insertP);

      return insertQ;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1, 'Please add a name'),
      description: z.string(),
      notes: z.string(),
      amount: z.number().min(1, 'Please add an amount'),
      unit: z.string().min(1, 'Please add a unit'),
      price: z.number(),
      carbs: z.number().min(0).max(1),
      proteins: z.number().min(0).max(1),
      fats: z.number().min(0).max(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { id, ...foodAttrs } = input;

      const [insertQ, insertP] = tql.query`
        UPDATE food ${tql.SET(foodAttrs)}
        WHERE user_id = ${userId}
          AND id = ${id}
          AND is_hidden = false`;
      await sql.query(insertQ, insertP);

      return insertQ;
    }),

  remove: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      await sql`UPDATE food SET is_hidden = true WHERE user_id = ${userId} AND id = ${input.id}`;
      return true;
    }),
});
