const AGENT_SERVER = process.env.VISION_AGENT_SERVER_URL ?? "http://localhost:8000";

export async function spawnAgent(
    callId: string,
    instructions: string
): Promise<{ session_id: string } | null> {
    const res = await fetch(`${AGENT_SERVER}/calls/${callId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            call_type: "default",
            instructions,         // passed as kwargs into create_agent()
        }),
    });

    if (!res.ok) {
        console.error("Agent server error:", await res.text());
        return null;
    }

    return res.json(); // { session_id, call_id, session_started_at }
}

export async function endAgentSession(
    callId: string,
    sessionId: string
): Promise<void> {
    await fetch(`${AGENT_SERVER}/calls/${callId}/sessions/${sessionId}`, {
        method: "DELETE",
    });
}