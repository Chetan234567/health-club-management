"""
File Path: python-chatbot-service/services/genai_client.py
Description: Asynchronous RAG AI Client calling Google Gemini API with retrieved context or RAG fallback engine.
"""
import os
import httpx
from dotenv import load_dotenv
from services.rag_knowledge_base import rag_knowledge_base

load_dotenv()


class GenAiClient:
    """
    RAG AI Client generating context-augmented answers for Health Club Management System.
    """

    def __init__(self):
        self.api_key = os.getenv("GENAI_API_KEY", "").strip()
        self.endpoint = os.getenv("GENAI_ENDPOINT", "https://generativelanguage.googleapis.com/v1beta/models").rstrip("/")
        self.model = os.getenv("GENAI_MODEL", "gemini-1.5-flash")

    async def reply(self, role_name: str, message: str) -> str:
        """
        RAG Execution Flow:
        1. Retrieve relevant knowledge context snippets matching the user query.
        2. Construct an augmented prompt combining system domain context + query.
        3. Query Gemini API or return intelligent RAG response.
        """
        # Step 1: Retrieve context from RAG Knowledge Base
        retrieved_context = rag_knowledge_base.retrieve_context(message)

        if not self.api_key:
            return self._rag_fallback(role_name, message, retrieved_context)

        # Step 2: Build RAG Augmented Prompt
        prompt = (
            f"You are the Health Club Management System (HCMS) AI Assistant.\n"
            f"Use the following RETRIEVED DOMAIN KNOWLEDGE to answer the user accurately:\n"
            f"--- RETRIEVED DOMAIN KNOWLEDGE ---\n"
            f"{retrieved_context}\n"
            f"-----------------------------------\n"
            f"User Role: {role_name}\n"
            f"User Query: {message}\n"
            f"Provide a helpful, brief, and accurate response based strictly on the retrieved knowledge."
        )

        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ]
        }

        url = f"{self.endpoint}/{self.model}:generateContent?key={self.api_key}"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()

                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts and "text" in parts[0]:
                        return parts[0]["text"].strip()

            return self._rag_fallback(role_name, message, retrieved_context)
        except Exception as ex:
            print(f"[RAG GenAiClient] API call error: {ex}. Using RAG fallback engine.")
            return self._rag_fallback(role_name, message, retrieved_context)

    def _rag_fallback(self, role_name: str, message: str, context: str) -> str:
        """
        Intelligent RAG fallback response generator returning retrieved knowledge context.
        """
        if context:
            return f"🤖 [RAG Knowledge Base Answer]\n{context}"
        
        return f"I am your Health Club Assistant for {role_name}s. You can manage membership plans (priced at ₹1), payments via Razorpay, trainers, and workouts from your dashboard."


# Singleton instance
genai_client = GenAiClient()
