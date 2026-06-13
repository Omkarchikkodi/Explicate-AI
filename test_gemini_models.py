# test_ddgs.py

from ddgs import DDGS

with DDGS() as ddgs:

    results = list(
        ddgs.text(
            "IPL 2025 winner",
            max_results=5
        )
    )

print(results)