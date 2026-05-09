
import { ErrorState } from '@/components/error-state'
import { LoadingState } from '@/components/loading-state'
import { auth } from '@/lib/auth'
import { loadSearchParams } from '@/modules/agents/params'
import { AgentsListHeader } from '@/modules/agents/ui/components/agents-list-header'
import { AgentView } from '@/modules/agents/ui/views/agent-view'
import { getQueryClient, trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { SearchParams } from 'nuqs'
import React, { Suspense } from 'react'
import { ErrorBoundary } from "react-error-boundary"

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
    await queryClient.prefetchQuery(trpc.agents.getMany.queryOptions({
        ...params
    }))
    return (
        <>
            <AgentsListHeader />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <Suspense fallback={<LoadingState title="Loading Agents" description="This may take few seconds." />}>
                    <ErrorBoundary fallback={<ErrorState title="Error Occurred" description="Failed to load agents." />}>
                        <AgentView />
                    </ErrorBoundary>
                </Suspense>
            </HydrationBoundary>
        </>
    )
}

export default page
