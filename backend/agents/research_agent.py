"""
Explicate AI — Multi Provider Agentic Research Loop
Supports:
- Anthropic
- OpenRouter/OpenAI-compatible APIs
- Gemini
"""

import json
import asyncio
from typing import AsyncGenerator

from  core.llm_provider import get_llm_client
from  core.config import settings
from  tools.web_tools import (
    TOOL_DEFINITIONS,
    execute_tool,
    get_openai_tools,
)

SYSTEM_PROMPT = """You are Explicate AI — an elite autonomous research agent that browses the web,
synthesizes information, and delivers clear, structured, cited answers.

## Your capabilities
- web_search: Find current information across the web
- fetch_page: Read full web pages
- extract_structured_data: Extract tables/lists/data

## Instructions
- Think step-by-step
- Use tools whenever needed
- Prefer accurate answers over fast answers
- Cite sources when possible
- Use markdown formatting
"""


class ExplicateAgent:
    """Agentic research loop with provider abstraction."""

    def __init__(self):

        self.provider, self.client = get_llm_client()

        print(f"Provider: {self.provider}")

    async def run(
        self,
        query: str,
        conversation_history: list | None = None,
    ) -> AsyncGenerator[dict, None]:

        # ========================================================
        # OPENROUTER
        # ========================================================

        if self.provider == "openrouter":

            async for event in self._run_openrouter(
                query,
                conversation_history,
            ):
                yield event

        # ========================================================
        # GEMINI
        # ========================================================

        elif self.provider == "gemini":

            async for event in self._run_gemini(
                query,
                conversation_history,
            ):
                yield event

        # ========================================================
        # ANTHROPIC
        # ========================================================

        elif self.provider == "anthropic":

            async for event in self._run_anthropic(
                query,
                conversation_history,
            ):
                yield event

        # ========================================================
        # INVALID
        # ========================================================

        else:

            yield {
                "type": "error",
                "message": f"Unsupported provider: {self.provider}"
            }

    # ============================================================
    # GEMINI IMPLEMENTATION
    # ============================================================

    async def _run_gemini(
        self,
        query: str,
        conversation_history: list | None = None,
    ):
        yield {
            "type": "thinking",
            "content": "Planning research strategy..."
        }

        await asyncio.sleep(1)

        plan_text = f"""
        Research Goal:
        {query}
        """

        yield {
            "type": "thinking",
            "content": "Research strategy prepared"
        }

        await asyncio.sleep(1)

        # =====================================================
        # STEP 1: SEARCH
        # =====================================================

        yield {
            "type": "thinking",
            "content": "Searching multiple sources..."
        }

        await asyncio.sleep(1)

        all_results = []

        queries = [query]

        for q in queries:

            result = await execute_tool(
                "web_search",
                {
                    "query": q,
                    "num_results": 5
                }
            )

            all_results.extend(
                result.get("results", [])
            )

        search_result = {
            "results": all_results
        }

        yield {
            "type": "tool_call",
            "name": "web_search",
            "input": {"query": query}
        }

        yield {
            "type": "tool_result",
            "name": "web_search",
            "result": search_result
        }

        # =====================================================
        # STEP 2: FETCH TOP PAGES
        # =====================================================

        yield {
            "type": "thinking",
            "content": "Reading source material..."
        }

        await asyncio.sleep(1)

        # urls = []

        # for item in search_result.get("results", []):
        #     url = item.get("url")
        #     if url:
        #         urls.append(url)

        urls = []

        for item in search_result.get("results", []):

            url = item.get("url")

            if url:
                urls.append(url)

        urls = list(dict.fromkeys(urls))

        page_results = []

        for url in urls[:3]:

            try:

                result = await execute_tool(
                    "fetch_page",
                    {
                        "url": url
                    }
                )

                page_results.append(result)

                yield {
                    "type": "tool_call",
                    "name": "fetch_page",
                    "input": {"url": url}
                }

                yield {
                    "type": "tool_result",
                    "name": "fetch_page",
                    "result": result
                }

            except Exception:
                pass

        # =====================================================
        # STEP 3: BUILD RESEARCH CONTEXT
        # =====================================================

        research_context = ""

        for page in page_results:

            research_context += f"""

    SOURCE:
    {page.get('url','')}

    TITLE:
    {page.get('title','')}

    CONTENT:
    {page.get('content','')[:1500]}

    """

        # Check after building context

        if not research_context.strip():

            yield {
                "type": "error",
                "message": "Unable to gather source content."
            }

            return

        # =====================================================
        # STEP 4: GEMINI SYNTHESIS
        # =====================================================

        yield {
            "type": "thinking",
            "content": "Performing cross-source analysis..."
        }

        await asyncio.sleep(1)

        print("STEP 4 STARTED")

        prompt = f"""
        You are an expert research analyst.

        User Question:
        {query}

        Research Findings:
        {research_context}

        Using only the research findings above, generate:

        # Direct Answer

        # Key Findings

        # Cross-Source Analysis

        # Hidden Insights

        # Future Implications

        # Sources

        Requirements:
        - Cross-check sources yourself
        - Mention contradictions if found
        - Derive non-obvious insights
        - Provide future implications
        - Use markdown
        """

        print("CALLING GEMINI")

        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        print("GEMINI RETURNED")

        yield {
            "type": "thinking",
            "content": "Generating final report..."
        }

        await asyncio.sleep(1)

        text = getattr(response, "text", "")

        print("TEXT LENGTH:", len(text))

        if not text:
            yield {
                "type": "error",
                "message": "Gemini returned an empty response."
            }
            return

        yield {
            "type": "answer_chunk",
            "content": text
        }

        yield {
            "type": "done",
            "sources": urls[:5]
        }

    # ============================================================
    # OPENROUTER IMPLEMENTATION
    # ============================================================

    async def _run_openrouter(
        self,
        query: str,
        conversation_history: list | None = None,
    ) -> AsyncGenerator[dict, None]:

        messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            }
        ]

        if conversation_history:
            messages.extend(conversation_history)

        messages.append({
            "role": "user",
            "content": query,
        })

        sources = []

        for _ in range(settings.MAX_AGENT_ITERATIONS):

            response = await self.client.chat.completions.create(
                model="google/gemma-4-31b-it:free",

                messages=messages,

                tools=get_openai_tools(),

                tool_choice="auto",

                stream=False,
            )

            msg = response.choices[0].message

            # ====================================================
            # TOOL CALLS
            # ====================================================

            if msg.tool_calls:

                yield {
                    "type": "thinking",
                    "content": f"Using {len(msg.tool_calls)} tool(s)"
                }

                assistant_message = {
                    "role": "assistant",
                    "content": msg.content or "",
                    "tool_calls": [],
                }

                for tc in msg.tool_calls:

                    tool_name = tc.function.name
                    tool_args = json.loads(tc.function.arguments)

                    assistant_message["tool_calls"].append({
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tool_name,
                            "arguments": tc.function.arguments,
                        }
                    })

                    yield {
                        "type": "tool_call",
                        "name": tool_name,
                        "input": tool_args,
                    }

                    result = await execute_tool(
                        tool_name,
                        tool_args,
                    )

                    yield {
                        "type": "tool_result",
                        "name": tool_name,
                        "result": result,
                    }

                    # Track sources
                    if isinstance(result, dict):
                        url = result.get("url")
                        if url and url not in sources:
                            sources.append(url)

                    messages.append(assistant_message)

                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": json.dumps(result),
                    })

                continue

            # ====================================================
            # FINAL RESPONSE
            # ====================================================

            final_text = msg.content or ""

            yield {
                "type": "answer_chunk",
                "content": final_text,
            }

            yield {
                "type": "done",
                "sources": sources,
            }

            return

        yield {
            "type": "error",
            "message": "Max iterations reached",
        }

    # ============================================================
    # ANTHROPIC IMPLEMENTATION
    # ============================================================

    async def _run_anthropic(
        self,
        query: str,
        conversation_history: list | None = None,
    ) -> AsyncGenerator[dict, None]:

        messages = list(conversation_history or [])

        messages.append({
            "role": "user",
            "content": query,
        })

        iteration = 0
        sources = []

        while iteration < settings.MAX_AGENT_ITERATIONS:

            iteration += 1

            response = await self.client.messages.create(
                model=settings.MODEL,

                max_tokens=settings.MAX_TOKENS,

                system=SYSTEM_PROMPT,

                tools=TOOL_DEFINITIONS,

                messages=messages,
            )

            assistant_content = response.content

            messages.append({
                "role": "assistant",
                "content": assistant_content,
            })

            full_text = ""
            tool_calls = []

            for block in response.content:

                if block.type == "text":

                    full_text += block.text

                    yield {
                        "type": "answer_chunk",
                        "content": block.text,
                    }

                elif block.type == "tool_use":

                    tool_calls.append(block)

            # ====================================================
            # FINAL RESPONSE
            # ====================================================

            if response.stop_reason == "end_turn" or not tool_calls:

                sources = _extract_sources(full_text)

                yield {
                    "type": "done",
                    "sources": sources,
                }

                return

            # ====================================================
            # TOOL EXECUTION
            # ====================================================

            yield {
                "type": "thinking",
                "content": f"Using {len(tool_calls)} tool(s)"
            }

            tool_results = await asyncio.gather(
                *[_run_tool(tc) for tc in tool_calls]
            )

            for tc, result in zip(tool_calls, tool_results):

                yield {
                    "type": "tool_call",
                    "name": tc.name,
                    "input": tc.input,
                }

                yield {
                    "type": "tool_result",
                    "name": tc.name,
                    "result": result,
                }

                if isinstance(result, dict):
                    url = result.get("url") or tc.input.get("url", "")
                    if url and url not in sources:
                        sources.append(url)

            tool_result_blocks = [
                {
                    "type": "tool_result",
                    "tool_use_id": tc.id,
                    "content": json.dumps(result),
                }
                for tc, result in zip(tool_calls, tool_results)
            ]

            messages.append({
                "role": "user",
                "content": tool_result_blocks,
            })

        yield {
            "type": "done",
            "sources": sources,
        }


async def _run_tool(tool_call) -> dict:

    try:

        result = await execute_tool(
            tool_call.name,
            tool_call.input,
        )

        return result

    except Exception as e:

        return {
            "error": str(e),
            "tool": tool_call.name,
        }


def _extract_sources(text: str) -> list[str]:

    import re

    urls = re.findall(
        r"https?://[^\s\)\]\>\"']+",
        text,
    )

    return list(dict.fromkeys(urls))