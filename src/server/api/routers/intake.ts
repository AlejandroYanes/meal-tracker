import { z } from 'zod';
import { format } from 'date-fns';
import { sql } from '@vercel/postgres';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { tql } from '@/utils/tql';

export const intakeRouter = createTRPCRouter({
  forDay: protectedProcedure
    .input(z.object({
      day: z.date(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const intakeRecordsQ = await sql<{
        meal_id: number;
        meal_name: string;
        carbs_goal: number;
        proteins_goal: number;
        fats_goal: number;
        foods: {
          id: number;
          name: string;
          description: string;
          notes: string;
          amount: number;
          unit: string;
          carbs: number;
          proteins: number;
          fats: number;
          price: number;
        }[];
      }>`
        SELECT
          m.id AS meal_id,
          m.name AS meal_name,
          m.carbs_goal,
          m.proteins_goal,
          m.fats_goal,
          COALESCE(JSON_AGG(
            CASE WHEN f.id IS NOT NULL THEN JSON_BUILD_OBJECT(
              'id', f.id,
              'name', f.name,
              'description', f.description,
              'notes', f.notes,
              'amount', mi.amount,
              'unit', f.unit,
              'carbs', f.carbs,
              'proteins', f.proteins,
              'fats', f.fats,
              'price', f.price
                ) END
              ) FILTER (WHERE f.id IS NOT NULL AND f.is_hidden = false), '[]') AS foods
        FROM meals m
          LEFT JOIN meal_intakes mi ON mi.meal_id = m.id AND mi.for_date::DATE = ${format(input.day, 'yyyy-MM-dd')} AND mi.user_id = ${userId}
          LEFT JOIN food f ON f.id = mi.food_id
        WHERE m.is_hidden = false
        GROUP BY m.id, m.name, m.carbs_goal, m.proteins_goal, m.fats_goal
        ORDER BY m.name;`;
      return intakeRecordsQ.rows;
    }),

  add: protectedProcedure
    .input(z.object({
      meal_id: z.number(),
      for_date: z.date(),
      food_id: z.number().min(0, 'Please select a food item'),
      amount: z.number().min(0, 'Please enter an amount'),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const [insertQ, insertP] = tql.query`
        INSERT INTO meal_intakes ${tql.VALUES({ ...input, for_date: input.for_date.toDateString(), user_id: userId })}`;
      await sql.query(insertQ, insertP);

      return true;
    }),
});
