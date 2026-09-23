"""
llm.py
------
Groq LLM client wrapper for structured JSON and JSON Schema completions.
"""

import json
import os
import time
from typing import Any, Dict

from dotenv import load_dotenv
from groq import Groq

# Load environment variables
load_dotenv(r"C:\HHGoa\.env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

_client = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY", GROQ_API_KEY)
        _client = Groq(api_key=api_key)
    return _client


def call_llm(system_prompt: str, user_prompt: str, response_schema: dict = None) -> Dict[str, Any]:
    """
    Call Groq. If response_schema is provided, use JSON Schema Mode.
    Otherwise, use json_object mode.
    """
    try:
        client = _get_client()
        model_name = os.getenv("GROQ_MODEL", GROQ_MODEL)

        kwargs = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0,
            "max_tokens": 2000,
        }

        if response_schema:
            kwargs["response_format"] = {
                "type": "json_schema",
                "json_schema": {
                    "name": "response",
                    "strict": True,
                    "schema": response_schema,
                },
            }
        else:
            kwargs["response_format"] = {"type": "json_object"}

        try:
            resp = client.chat.completions.create(**kwargs)
            content = resp.choices[0].message.content or "{}"
            return json.loads(content)
        except Exception as primary_exc:
            fallback_model = os.getenv("GROQ_FALLBACK_MODEL", "qwen/qwen3.8-27b")
            if model_name != fallback_model:
                kwargs["model"] = fallback_model
                if response_schema:
                    kwargs["response_format"] = {
                        "type": "json_schema",
                        "json_schema": {
                            "name": "response",
                            "strict": True,
                            "schema": response_schema,
                        },
                    }
                resp = client.chat.completions.create(**kwargs)
                content = resp.choices[0].message.content or "{}"
                return json.loads(content)
            return {"error": str(primary_exc)}
    except Exception as exc:
        return {"error": str(exc)}


def call_llm_with_retry(system_prompt: str, user_prompt: str, response_schema: dict = None, max_retries: int = 2) -> Dict[str, Any]:
    """Call LLM with exponential backoff retry on errors or JSON decode failures, supporting JSON schema mode."""
    delay = 1.0
    last_res = {"error": "No attempts made"}

    for attempt in range(max_retries + 1):
        res = call_llm(system_prompt, user_prompt, response_schema)
        if "error" not in res:
            return res
        last_res = res
        if attempt < max_retries:
            time.sleep(delay)
            delay *= 2.0

    return last_res
