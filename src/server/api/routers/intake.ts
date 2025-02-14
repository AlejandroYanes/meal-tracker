import { z } from 'zod';
import { sql } from '@vercel/postgres';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

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
          JSON_AGG(
              JSON_BUILD_OBJECT(
                  'id', f.id,
                  'name', f.name,
                  'description', f.description,
                  'notes', f.notes,
                  'amount', f.amount,
                  'unit', f.unit,
                  'carbs', f.carbs,
                  'proteins', f.proteins,
                  'fats', f.fats,
                  'price', f.price
              )
          ) AS foods
      FROM meals m
      LEFT JOIN meal_intakes mi ON mi.meal_id = m.id
      LEFT JOIN food f ON f.id = mi.food_id
      WHERE mi.for_date = ${input.day.toDateString()} AND mi.user_id = ${userId}
      GROUP BY m.id, m.name, m.carbs_goal, m.proteins_goal, m.fats_goal
      ORDER BY m.name;`;
      return intakeRecordsQ.rows;
    }),
});
