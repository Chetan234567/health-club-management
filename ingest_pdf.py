"""
File Path: python-chatbot-service/ingest_pdf.py
Description: Ingests HCMS_INFO.pdf into In-Memory PDF Store with page metadata for Agentic RAG retrieval (replacing ChromaDB).
"""

import os
from services.pdf_retriever import pdf_retriever

def ingest_pdf():
    print("Initializing PDF ingestion...")
    retrieved = pdf_retriever.retrieve("health club membership plans", top_k=3)
    print("[OK] Ingested passages successfully.")
    print(f"Sample pages referenced: {retrieved.get('pages_str')}")
    print(f"Sample passage excerpt:\n{retrieved.get('context')[:300]}...")
    return pdf_retriever

if __name__ == "__main__":
    ingest_pdf()
