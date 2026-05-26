import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { auth } from "@/lib/auth"
import { MeetingsListHeader } from "@/modules/meetings/ui/components/meetings-list-header"
import { MeetingsView } from "@/modules/meetings/ui/view/meetings-view"
import { getQueryClient, trpc } from "@/trpc/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import type { SearchParams } from "nuqs/server"
import { loadSearchParams } from "@/modules/agents/params"

interface Props {
    searchParams: Promise<SearchParams>
}

const page = async ({ searchParams }: Props) => {

    const params = await loadSearchParams(searchParams)

    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        redirect("/signin")
    }
    const queryClient = getQueryClient()
    await queryClient.prefetchQuery(trpc.meetings.getMany.queryOptions({
        ...params
    }))
    return (
        <>
            <MeetingsListHeader />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense fallback={<LoadingState title="Loading Meetings" description="This may take few seconds" />}>
                    <ErrorBoundary fallback={<ErrorState title="Error Loading Meetings" description="Something went wrong" />}>
                        <MeetingsView />
                    </ErrorBoundary>
                </Suspense>
            </HydrationBoundary>
        </>
    )
}

export default page
