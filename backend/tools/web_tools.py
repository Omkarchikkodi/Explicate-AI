"""
Tool definitions for the Explicate AI agent.
These tools are passed to Claude via the Anthropic API.
"""

import httpx
from bs4 import BeautifulSoup
from typing import Any
from ddgs  import DDGS

# ── Tool schemas (sent to the Anthropic API) ──────────────────────────────────


TOOL_DEFINITIONS = [
    {
        "name": "web_search",
        "description": (
            "Search the web for current information."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query"
                },
                "num_results": {
                    "type": "integer",
                    "description": "Number of results",
                    "default": 5,
                },
            },
            "required": ["query"],
        },
    },

    {
        "name": "fetch_page",
        "description": (
            "Fetch full content from a web page URL."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "Page URL"
                },
            },
            "required": ["url"],
        },
    },

    {
        "name": "extract_structured_data",
        "description": (
            "Extract tables/lists/structured data from a webpage."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "Target URL"
                },
                "data_type": {
                    "type": "string",
                    "enum": ["tables", "lists", "all"],
                    "default": "all",
                },
            },
            "required": ["url"],
        },
    },
]

def get_openai_tools():
    """
    Convert Anthropic-style tools
    into OpenAI/OpenRouter-compatible tools.
    """

    converted = []

    for tool in TOOL_DEFINITIONS:

        converted.append({
            "type": "function",

            "function": {
                "name": tool["name"],
                "description": tool["description"],
                "parameters": tool["input_schema"],
            }
        })

    return converted

# ── Tool implementations ──────────────────────────────────────────────────────

async def execute_tool(tool_name: str, tool_input: dict) -> Any:
    """Dispatch and execute the appropriate tool."""
    if tool_name == "web_search":
        return await _web_search(tool_input["query"], tool_input.get("num_results", 5))
    elif tool_name == "fetch_page":
        return await _fetch_page(tool_input["url"])
    elif tool_name == "extract_structured_data":
        return await _extract_structured_data(
            tool_input["url"], tool_input.get("data_type", "all")
        )
    else:
        return {"error": f"Unknown tool: {tool_name}"}


async def _web_search(query: str, num_results: int = 5) -> dict:

    try:

        print("=" * 60)
        print("STARTING SEARCH:", query)
        print("=" * 60)

        with DDGS() as ddgs:

            results = list(
                ddgs.text(
                    query,
                    region="wt-wt",
                    safesearch="off",
                    max_results=num_results
                )
            )

        print("RAW RESULTS:")
        print(results)

        formatted = []

        for r in results:

            formatted.append({
                "title": r.get("title", ""),
                "url": r.get("href", ""),
                "snippet": r.get("body", ""),
            })

        print("TOTAL FOUND:", len(formatted))

        for r in formatted:
            print("TITLE:", r["title"])
            print("URL:", r["url"])
            print("-" * 50)

        return {
            "query": query,
            "results": formatted,
            "total_found": len(formatted),
        }

    except Exception as e:

        import traceback

        print("=" * 60)
        print("SEARCH ERROR")
        print("=" * 60)

        traceback.print_exc()

        return {
            "error": str(e),
            "query": query,
            "results": [],
        }

async def _fetch_page(url: str) -> dict:
    """Fetch and clean a web page's text content."""
    try:
        async with httpx.AsyncClient(
            timeout=15.0,
            follow_redirects=True,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (compatible; ExplicateAI/1.0; +https://explicate.ai)"
                )
            },
        ) as client:
            resp = await client.get(url)
            resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        # Remove script/style/nav/footer noise
        for tag in soup(["script", "style", "nav", "footer", "header", "aside", "iframe"]):
            tag.decompose()

        title = soup.title.string.strip() if soup.title else url

        # Extract main content (prefer article/main tags)
        main = soup.find("article") or soup.find("main") or soup.find("body")
        text = main.get_text(separator="\n", strip=True) if main else ""

        # Truncate to ~8000 chars to keep context manageable
        text = text[:8000] + ("..." if len(text) > 8000 else "")

        return {"url": url, "title": title, "content": text, "length": len(text)}

    except Exception as e:
        return {"error": f"Failed to fetch {url}: {str(e)}", "url": url}


async def _extract_structured_data(url: str, data_type: str = "all") -> dict:
    """Extract tables and/or lists from a page."""
    try:
        async with httpx.AsyncClient(
            timeout=15.0,
            follow_redirects=True,
            headers={"User-Agent": "Mozilla/5.0 (compatible; ExplicateAI/1.0)"},
        ) as client:
            resp = await client.get(url)
            resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")
        result: dict = {"url": url}

        if data_type in ("tables", "all"):
            tables = []
            for table in soup.find_all("table")[:5]:
                rows = []
                for row in table.find_all("tr"):
                    cells = [cell.get_text(strip=True) for cell in row.find_all(["td", "th"])]
                    if cells:
                        rows.append(cells)
                if rows:
                    tables.append(rows)
            result["tables"] = tables

        if data_type in ("lists", "all"):
            lists = []
            for lst in soup.find_all(["ul", "ol"])[:10]:
                items = [li.get_text(strip=True) for li in lst.find_all("li")]
                if items:
                    lists.append(items)
            result["lists"] = lists

        return result

    except Exception as e:
        return {"error": f"Failed to extract from {url}: {str(e)}", "url": url}
