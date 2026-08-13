"""
File Path: ChatBot_HCMS/services/pdf_retriever.py
Description: In-Memory PDF Loader and Retrieval Engine replacing ChromaDB.
Extracts text from data/HCMS_INFO.pdf page by page and provides keyword/semantic context search with page citations.
"""

import os
import re
from typing import List, Dict, Any, Tuple
from pypdf import PdfReader


class PDFRetriever:
    """
    In-memory RAG retriever for PDF documentation without external vector databases like ChromaDB.
    """

    def __init__(self, pdf_path: str = None):
        if pdf_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            pdf_path = os.path.join(base_dir, "data", "HCMS_INFO.pdf")
        self.pdf_path = pdf_path
        self.passages: List[Dict[str, Any]] = []
        self._load_and_index_pdf()

    def _load_and_index_pdf(self):
        """Extracts text from PDF page by page and indexes paragraphs."""
        self.passages = []
        if not os.path.exists(self.pdf_path):
            print(f"[PDFRetriever Warning] PDF file not found at: {self.pdf_path}")
            return

        try:
            reader = PdfReader(self.pdf_path)
            for page_idx, page in enumerate(reader.pages):
                page_num = page_idx + 1
                page_text = page.extract_text() or ""
                if not page_text.strip():
                    continue

                paragraphs = [p.strip() for p in page_text.split("\n\n") if p.strip()]
                for para_idx, para in enumerate(paragraphs):
                    self.passages.append({
                        "id": f"page_{page_num}_para_{para_idx + 1}",
                        "page": page_num,
                        "text": para
                    })
            print(f"[OK] PDFRetriever loaded {len(self.passages)} passages from {len(reader.pages)} pages of {os.path.basename(self.pdf_path)}.")
        except Exception as e:
            print(f"[PDFRetriever Error] Failed to read PDF: {e}")

    def retrieve(self, query: str, top_k: int = 3) -> Dict[str, Any]:
        """
        Searches passages for keywords matching query and returns matched text and referenced page numbers.
        """
        if not self.passages:
            self._load_and_index_pdf()

        query_words = set(re.findall(r"\w+", query.lower()))
        # Filter out common stop words
        stop_words = {"the", "a", "an", "is", "are", "was", "were", "to", "in", "on", "at", "for", "of", "and", "or", "it", "this", "that", "i", "you", "he", "she", "we", "they", "my", "your", "what", "how", "where", "can", "do", "does"}
        filtered_words = query_words - stop_words

        if not filtered_words:
            filtered_words = query_words

        scored: List[Tuple[float, Dict[str, Any]]] = []
        for passage in self.passages:
            text_lower = passage["text"].lower()
            text_words = set(re.findall(r"\w+", text_lower))

            overlap = len(filtered_words.intersection(text_words))
            if overlap > 0:
                score = float(overlap)
                for w in filtered_words:
                    if w in text_lower:
                        score += 0.5
                scored.append((score, passage))

        scored.sort(key=lambda x: x[0], reverse=True)
        top_matches = [item[1] for item in scored[:top_k]]

        if not top_matches:
            top_matches = self.passages[:top_k]

        referenced_pages = sorted(list(set(p["page"] for p in top_matches)))
        pages_str = ", ".join(f"Page {p}" for p in referenced_pages) if referenced_pages else "Page 1"
        context_text = "\n---\n".join([p["text"] for p in top_matches])

        return {
            "context": context_text,
            "pages": referenced_pages,
            "pages_str": pages_str,
            "passages": top_matches
        }


# Singleton instance
pdf_retriever = PDFRetriever()
