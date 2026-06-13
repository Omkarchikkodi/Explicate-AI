# """
# Core configuration for Explicate AI
# """

# import os
# from pydantic_settings import BaseSettings
# from typing import List


# class Settings(BaseSettings):
#     ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
#     OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
#     ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]
#     MAX_AGENT_ITERATIONS: int = 10
#     MODEL: str = "claude-opus-4-5"
#     MAX_TOKENS: int = 4096

#     class Config:
#         env_file = ".env"


# settings = Settings()


"""
Core configuration for Explicate AI
"""

import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from pydantic_settings import BaseSettings


# Explicitly load backend/.env
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)


class Settings(BaseSettings):
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "gemini")

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    MAX_AGENT_ITERATIONS: int = 10

    MODEL: str = "claude-opus-4-5"

    MAX_TOKENS: int = 4096


settings = Settings()