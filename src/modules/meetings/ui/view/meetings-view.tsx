
"use client"

import { DataTable } from "@/components/data-table"
import { useTRPC } from "@/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"
import { columns } from "../components/columns"
import { EmptyState } from "@/components/empty-state"

const MeetingsView = () => {
    const trpc = useTRPC()
    const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({}))
    return (
        <div>
            {/* {JSON.stringify(data)} */}
            <DataTable data={data.items} columns={columns} />
            {data.items.length === 0 && (
                <EmptyState title="Create your first meeting"
                    description="Schedule a meeting to connect with others. Each meeting lets you collaborate, share ideas, and interact with participants in real time." />
            )}
        </div>
    )
}

export { MeetingsView }
