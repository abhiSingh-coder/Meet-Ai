
import { ErrorState } from '@/components/error-state'
import { LoadingState } from '@/components/loading-state'
import { AgentView } from '@/modules/agents/ui/views/agent-view'
import { getQueryClient, trpc } from '@/trpc/server'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import React, { Suspense } from 'react'
import { ErrorBoundary } from "react-error-boundary"

const page = async () => {
    const queryClient = getQueryClient()
    void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions())
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<LoadingState title="Loading Agents" description="This may take few seconds." />}>
                <ErrorBoundary fallback = {<ErrorState title="Error Occurred" description="Failed to load agents." />}>
                    <AgentView />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}

export default page
