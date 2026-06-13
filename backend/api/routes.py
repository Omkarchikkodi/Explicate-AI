"""
API routes for Explicate AI.
Uses Server-Sent Events (SSE) for real-time streaming of agent steps.
"""

import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from  agents.research_agent import ExplicateAgent

router = APIRouter()
agent = ExplicateAgent()


# ── Request / Response models ─────────────────────────────────────────────────

class QueryRequest(BaseModel):
    query: str
    conversation_history: list = []


class SuggestRequest(BaseModel):
    partial: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/query/stream")
async def query_stream(req: QueryRequest):
    """
    Stream the agent's research process as Server-Sent Events.
    Each event is a JSON object with a 'type' field.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    async def event_generator():
        try:
            async for event in agent.run(
                query=req.query,
                conversation_history=req.conversation_history,
            ):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        finally:
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/query")
async def query_sync(req: QueryRequest):
    """
    Non-streaming endpoint: runs the full agent loop and returns the final answer.
    Useful for testing or simple integrations.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    answer_parts = []
    sources = []
    tool_calls_log = []

    async for event in agent.run(
        query=req.query,
        conversation_history=req.conversation_history,
    ):
        if event["type"] == "answer_chunk":
            answer_parts.append(event["content"])
        elif event["type"] == "done":
            sources = event.get("sources", [])
        elif event["type"] == "tool_call":
            tool_calls_log.append(
                {"tool": event["name"], "input": event["input"]}
            )

    return {
        "answer": "".join(answer_parts),
        "sources": sources,
        "tools_used": tool_calls_log,
    }


@router.get("/suggest")
async def suggest_queries(q: str = ""):
    """Return query suggestions based on partial input."""
    suggestions = [
        "What are the latest AI research breakthroughs?",
        "Compare the top cloud providers in 2025",
        "What is the current price of Bitcoin?",
        "Explain quantum computing in simple terms",
        "What are the best open-source LLMs available now?",
        "Latest news in semiconductor industry",
        "How does RAG work in AI systems?",
    ]
    if q:
        filtered = [s for s in suggestions if q.lower() in s.lower()]
        return {"suggestions": filtered[:5]}
    return {"suggestions": suggestions[:5]}
