"""
File Path: python-chatbot-service/services/rag_agent_service.py

Description:
Agentic Retrieval-Augmented Generation (RAG) Service for the
Health Club Management System (HCMS).

Features:
- Retrieves relevant documents from ChromaDB.
- Generates responses only from retrieved knowledge.
- Returns page references when available.
"""

import os
import chromadb
from typing import Dict, Any

# ChromaDB Configuration
DB_DIR_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "my_chroma_db"
)

COLLECTION_NAME = "hcms-info-knowledge-base"

# Initialize ChromaDB
db_client = chromadb.PersistentClient(path=DB_DIR_PATH)

try:
    collection = db_client.get_or_create_collection(
        name=COLLECTION_NAME
    )
except Exception:
    collection = db_client.create_collection(
        name=COLLECTION_NAME
    )


def retrieve_knowledge(question: str) -> Dict[str, Any]:
    """
    Retrieve the most relevant documents from ChromaDB.
    """
    try:
        return collection.query(
            query_texts=[question],
            n_results=3
        )
    except Exception as e:
        return {
            "error": str(e),
            "documents": [[]],
            "metadatas": [[]]
        }


class AgenticRAGService:
    """
    Agentic RAG Pipeline

    Steps:
    1. Retrieve relevant documents.
    2. Extract page references.
    3. Generate answer only from retrieved documents.
    """

    def process_query(self, role_name: str, question: str) -> str:

        results = retrieve_knowledge(question)

        documents = results.get("documents", [[]])[0]
        metadata = results.get("metadatas", [[]])[0]

        if not documents:
            return (
                "Reference => No details available\n"
                "Answer => The knowledge base does not contain "
                "enough information to answer this question."
            )

        # Collect page numbers
        pages = sorted(
            {
                item.get("page")
                for item in metadata
                if isinstance(item, dict) and item.get("page") is not None
            }
        )

        if pages:
            reference = ", ".join(f"Page {page}" for page in pages)
        else:
            reference = "Retrieved Documents"

        # Combine retrieved context
        answer = "\n\n".join(documents)

        return (
            f"Reference => {reference}\n"
            f"Answer => {answer}"
        )


# Singleton instance
agentic_rag_service = AgenticRAGService()