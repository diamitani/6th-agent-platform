"""
Ollama Client for DeepSeek Integration
Handles all LLM inference via local Ollama server
"""

import os
import json
from typing import AsyncGenerator, Optional, Dict, Any, List
import httpx
from loguru import logger


class OllamaClient:
    """Client for Ollama API with DeepSeek models"""

    def __init__(
        self,
        host: str = None,
        timeout: int = 120
    ):
        self.host = host or os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self.timeout = timeout
        self.client = httpx.AsyncClient(timeout=timeout)

    async def list_models(self) -> List[str]:
        """List available models"""
        try:
            response = await self.client.get(f"{self.host}/api/tags")
            response.raise_for_status()
            data = response.json()
            return [model["name"] for model in data.get("models", [])]
        except Exception as e:
            logger.error(f"Failed to list models: {e}")
            return []

    async def generate(
        self,
        model: str,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> str:
        """Generate completion (non-streaming)"""
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
            }
        }

        if system:
            payload["system"] = system

        if max_tokens:
            payload["options"]["num_predict"] = max_tokens

        payload["options"].update(kwargs)

        try:
            response = await self.client.post(
                f"{self.host}/api/generate",
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            raise

    async def generate_stream(
        self,
        model: str,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Generate completion with streaming"""
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": True,
            "options": {
                "temperature": temperature,
            }
        }

        if system:
            payload["system"] = system

        if max_tokens:
            payload["options"]["num_predict"] = max_tokens

        payload["options"].update(kwargs)

        try:
            async with self.client.stream(
                "POST",
                f"{self.host}/api/generate",
                json=payload
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            if "response" in data:
                                yield data["response"]
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            logger.error(f"Stream generation failed: {e}")
            raise

    async def embed(
        self,
        model: str,
        text: str
    ) -> List[float]:
        """Generate embeddings"""
        payload = {
            "model": model,
            "prompt": text
        }

        try:
            response = await self.client.post(
                f"{self.host}/api/embeddings",
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            return data.get("embedding", [])
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            raise

    async def embed_batch(
        self,
        model: str,
        texts: List[str]
    ) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        embeddings = []
        for text in texts:
            embedding = await self.embed(model, text)
            embeddings.append(embedding)
        return embeddings

    async def chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        stream: bool = False,
        **kwargs
    ) -> Any:
        """Chat completion (OpenAI-style)"""
        payload = {
            "model": model,
            "messages": messages,
            "stream": stream,
            "options": {
                "temperature": temperature,
            }
        }

        payload["options"].update(kwargs)

        try:
            if stream:
                return self._chat_stream(payload)
            else:
                response = await self.client.post(
                    f"{self.host}/api/chat",
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                return data.get("message", {}).get("content", "")
        except Exception as e:
            logger.error(f"Chat failed: {e}")
            raise

    async def _chat_stream(
        self,
        payload: Dict[str, Any]
    ) -> AsyncGenerator[str, None]:
        """Internal chat streaming method"""
        try:
            async with self.client.stream(
                "POST",
                f"{self.host}/api/chat",
                json=payload
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            if "message" in data:
                                content = data["message"].get("content", "")
                                if content:
                                    yield content
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            logger.error(f"Chat stream failed: {e}")
            raise

    async def pull_model(
        self,
        model: str
    ) -> None:
        """Pull/download a model"""
        payload = {"name": model}

        try:
            async with self.client.stream(
                "POST",
                f"{self.host}/api/pull",
                json=payload
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            status = data.get("status", "")
                            logger.info(f"Pull {model}: {status}")
                        except json.JSONDecodeError:
                            continue
        except Exception as e:
            logger.error(f"Model pull failed: {e}")
            raise

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()


# Global instance
_ollama_client: Optional[OllamaClient] = None


def get_ollama_client() -> OllamaClient:
    """Get global Ollama client instance"""
    global _ollama_client
    if _ollama_client is None:
        _ollama_client = OllamaClient()
    return _ollama_client
