import { z } from "zod"
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, count, desc, eq, getTableColumns, ilike } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { TRPCError } from "@trpc/server";

export const meetingsRouter = createTRPCRouter({


    getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async (opts) => {
        const [existingMeetings] = await db.select(
            {
                ...getTableColumns(meetings),
            }
        ).from(meetings).where(
            and(
                eq(meetings.id, opts.input.id),
                eq(meetings.userId, opts.ctx.auth.user.id)
            )
        )
        if (!existingMeetings) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" })
        }
        return existingMeetings
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
                    ...getTableColumns(meetings),
                }
            )
                .from(meetings)
                .where(
                    and(
                        eq(meetings.userId, opts.ctx.auth.user.id),
                        search ? ilike(meetings.name, `%${search}%`) : undefined
                    )
                )
                .orderBy(desc(meetings.createdAt), desc(meetings.id))
                .limit(pageSize)
                .offset((page - 1) * pageSize)

            const total = await db.select({
                count: count()
            })
                .from(meetings)
                .where(
                    and(
                        eq(meetings.userId, opts.ctx.auth.user.id),
                        search ? ilike(meetings.name, `%${search}%`) : undefined
                    )
                )

            const totalPages = Math.ceil(total[0].count / pageSize)

            return {
                items: data,
                total: total[0].count,
                totalPages: totalPages
            }
        }),


})