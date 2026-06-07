import { z } from "zod"
import { db } from "@/db";
import { agents } from "@/db/schema";
import { createTRPCRouter, premiumProcedure, protectedProcedure } from "@/trpc/init";
import { agentsInsertSchema, agentsUpdateSchema } from "../schema";
import { and, count, desc, eq, getTableColumns, ilike, sql } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { TRPCError } from "@trpc/server";

export const agentsRouter = createTRPCRouter({

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {

      const [removeAgent] = await db.delete(agents).where(
        and(
          eq(agents.id, opts.input.id),
          eq(agents.userId, opts.ctx.auth.user.id)
        )
      ).returning()

      if (!removeAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Required Agent not found."
        })
      }
      return removeAgent
    }),

  update: protectedProcedure
    .input(agentsUpdateSchema)
    .mutation(async (opts) => {
      const [updateAgent] = await db.update(agents).set(opts.input).where(
        and(
          eq(agents.id, opts.input.id),
          eq(agents.userId, opts.ctx.auth.user.id)
        )
      ).returning()

      if (!updateAgent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Required Agent not found."
        })
      }
      return updateAgent
    }),

  getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async (opts) => {
    const [existingAgent] = await db.select(
      {
        ...getTableColumns(agents),
        meetingCount: sql<number>`5`
      }
    ).from(agents).where(
      and(
        eq(agents.id, opts.input.id),
        eq(agents.userId, opts.ctx.auth.user.id)
      )
    )
    if (!existingAgent) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" })
    }
    return existingAgent
  }),

  getMany: protectedProcedure
    .input(z.object({
      page: z.number().int().min(DEFAULT_PAGE).default(DEFAULT_PAGE),
      pageSize: z.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
      search: z.string().nullish()
    }))
    .query(async (opts) => {
      const { search, page, pageSize } = opts.input
      const data = await db.select(
        {
          meetingCount: sql<number>`5`,
          ...getTableColumns(agents),
        }
      )
        .from(agents)
        .where(
          and(
            eq(agents.userId, opts.ctx.auth.user.id),
            search ? ilike(agents.name, `%${search}%`) : undefined
          )
        )
        .orderBy(desc(agents.createdAt), desc(agents.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize)

      const total = await db.select({
        count: count()
      })
        .from(agents)
        .where(
          and(
            eq(agents.userId, opts.ctx.auth.user.id),
            search ? ilike(agents.name, `%${search}%`) : undefined
          )
        )

      const totalPages = Math.ceil(total[0].count / pageSize)

      return {
        items: data,
        total: total[0].count,
        totalPages: totalPages
      }
    }),

  create: premiumProcedure("agents")
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