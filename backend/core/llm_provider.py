# from anthropic import AsyncAnthropic
# from openai import AsyncOpenAI
# from google import genai

# from backend.core.config import settings


# def get_llm_client():

#     provider = settings.LLM_PROVIDER.lower()

#     # =========================================================
#     # ANTHROPIC
#     # =========================================================

#     if provider == "anthropic":

#         print("Using Anthropic")

#         return (
#             "anthropic",
#             AsyncAnthropic(
#                 api_key=settings.ANTHROPIC_API_KEY
#             )
#         )

#     # =========================================================
#     # OPENROUTER
#     # =========================================================

#     elif provider == "openrouter":

#         print("Using OpenRouter")

#         return (
#             "openrouter",
#             AsyncOpenAI(
#                 api_key=settings.OPENROUTER_API_KEY,
#                 base_url="https://openrouter.ai/api/v1"
#             )
#         )

#     # =========================================================
#     # GEMINI
#     # =========================================================

#     elif provider == "gemini":

#         print("Using Gemini")
#         print(
#             "KEY LOADED:",
#             settings.GEMINI_API_KEY[:12]
#             if settings.GEMINI_API_KEY
#             else "EMPTY"
#         )

#         client = genai.Client(
#             api_key=settings.GEMINI_API_KEY
#         )

#         return (
#             "gemini",
#             client
#         )

#     # =========================================================
#     # INVALID PROVIDER
#     # =========================================================

#     else:

#         raise ValueError(
#             f"Unsupported provider: {provider}"
#         )


from google import genai
from anthropic import AsyncAnthropic
from openai import AsyncOpenAI

from backend.core.config import settings


def get_llm_client():

    provider = settings.LLM_PROVIDER.lower()

    if provider == "gemini":

        print("Using Gemini")

        client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

        return (
            "gemini",
            client
        )

    elif provider == "anthropic":

        return (
            "anthropic",
            AsyncAnthropic(
                api_key=settings.ANTHROPIC_API_KEY
            )
        )

    elif provider == "openrouter":

        return (
            "openrouter",
            AsyncOpenAI(
                api_key=settings.OPENROUTER_API_KEY,
                base_url="https://openrouter.ai/api/v1"
            )
        )

    raise ValueError(
        f"Unsupported provider: {provider}"
    )