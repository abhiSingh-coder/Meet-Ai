import { z } from "zod"
import { db } from "@/db";
import { agents } from "@/db/schema";
import {  createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { agentsInsertSchema } from "../schema";
import { eq, getTableColumns, sql } from "drizzle-orm";

export const agentsRouter = createTRPCRouter({
  getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async (opts) => {
    const [existingAgent] = await db.select(
      {
        ...getTableColumns(agents),
        meetingCount : sql<number>`5`
      }
    ).from(agents).where(eq(agents.id, opts.input.id))
    return existingAgent
  }),

  getMany: protectedProcedure.query(async () => {
    const data = await db.select().from(agents)
    return data
  }),

  create: protectedProcedure
    .input(agentsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, instructions } = input
      const { auth } = ctx
      const [createdAgent] = await db.insert(agents).values({
        name,
        instructions,
        userId: auth.user.id
      }).returning()
      return createdAgent
    })
})