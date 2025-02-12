import { createCallerFactory, createTRPCRouter } from '@/server/api/trpc';
import { foldersRouter } from '@/server/api/routers/folders';
import { articlesRouter } from '@/server/api/routers/articles';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  folders: foldersRouter,
  articles: articlesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
