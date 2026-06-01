import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import type { Channel as StreamChannel } from "stream-chat";
import {
    Chat,
    Channel,
    Window,
    MessageList,
    Thread,
    MessageComposer,
    useCreateChatClient,
} from "stream-chat-react";

import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";

import "stream-chat-react/dist/css/index.css";

interface ChatUIProps {
    meetingId: string;
    meetingName: string;
    userId: string;
    userName: string;
    userImage: string | undefined;
};

export const ChatUI = ({
    meetingId,
    meetingName,
    userId,
    userName,
    userImage,
}: ChatUIProps) => {
    const trpc = useTRPC();
    const { mutateAsync: generateChatToken } = useMutation(
        trpc.meetings.generateChatToken.mutationOptions(),
    );

    const [channel, setChannel] = useState<StreamChannel>();
    const client = useCreateChatClient({
        apiKey: process.env.NEXT_PUBLIC_STREAM_CHAT_API_KEY!,
        tokenOrProvider: generateChatToken,
        userData: {
            id: userId,
            name: userName,
            image: userImage,
        },
    });

    useEffect(() => {
        if (!client) return;

        let cancelled = false;

        const initChannel = async () => {
            try {
                const ch = client.channel("messaging", meetingId, {
                    members: [userId],
                });

                await ch.watch();

                if (!cancelled) {
                    setChannel(ch);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Channel init error:", err);
                }
            }
        };

        initChannel();

        return () => {
            cancelled = true;
            // ✅ stop watching channel on unmount
            client
                .channel("messaging", meetingId)
                .stopWatching()
                .catch(() => { }); // silently ignore if already disconnected
        };
    }, [client, meetingId, userId]);
    
    if (!client || !channel) {
        return (
            <LoadingState
                title="Loading Chat"
                description="This may take a few seconds"
            />
        );
    }

    return (
        <div className="bg-white rounded-lg border overflow-hidden">
            <Chat client={client}>
                <Channel channel={channel}>
                    <Window>
                        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-23rem)] border-b">
                            <MessageList />
                        </div>
                        <MessageComposer />
                    </Window>
                    <Thread />
                </Channel>
            </Chat>
        </div>
    )
}