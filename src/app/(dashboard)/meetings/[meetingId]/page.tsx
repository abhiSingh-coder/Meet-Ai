import { ErrorState } from "@/components/error-state"
import { LoadingState } from "@/components/loading-state"
import { auth } from "@/lib/auth"
import { MeetingIdView } from "@/modules/meetings/ui/view/meeting-id-view"
import { getQueryClient, trpc } from "@/trpc/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

interface Props {
  params: Promise<{
    meetingId: string
  }>
}

const page = async ({ params }: Props) => {

  const { meetingId } = await params

  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect('/sign-in')
  }

  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(trpc.meetings.getOne.queryOptions({ id: meetingId }))

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<LoadingState title="Loading the Meeting" description="This may take few seconds" />}>
          <ErrorBoundary fallback={<ErrorState title="Error in Loading the Meeting" description="Something went wrong" />}>
            <MeetingIdView meetingId={meetingId} />
          </ErrorBoundary>
        </Suspense>

      </HydrationBoundary>
    </>
  )
}

export default page
