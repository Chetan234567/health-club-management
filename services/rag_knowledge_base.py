"""
File Path: python-chatbot-service/services/rag_knowledge_base.py

Description:
Retrieval-Augmented Generation (RAG) Knowledge Base for the
Health Club Management System (HCMS).

Purpose:
- Stores business/domain knowledge used by the AI chatbot.
- Retrieves the most relevant information based on the user's query
  using a simple keyword similarity search.
"""

import re
from typing import List, Dict


class RAGKnowledgeBase:
    """
    RAG Knowledge Base containing business knowledge documents
    and a lightweight keyword-based retrieval engine.
    """

    def __init__(self):
        self.documents: List[Dict[str, str]] = [
            {
                "id": "health_club_overview",
                "category": "Health Club Management System",
                "content": (
                    "The Health Club Management System (HCMS) is a web application "
                    "designed to simplify gym management. It provides member management, "
                    "trainer management, membership plans, online payments, workout scheduling, "
                    "diet planning, and trainer assignment in a single platform."
                )
            },
            {
                "id": "membership_plans",
                "category": "Membership Plans",
                "content": (
                    "The Health Club Management System offers multiple membership plans "
                    "such as Monthly Gym, Strength Pro, Yoga Plus, Cardio Elite, "
                    "Elite Annual, and VIP Annual. Each plan provides access for "
                    "a specific duration ranging from one month to one year."
                )
            },
            {
                "id": "subscription_rules",
                "category": "Subscription Rules",
                "content": (
                    "A member can have only one active membership plan at a time. "
                    "A new membership plan can be purchased only after the current "
                    "membership expires."
                )
            },
            {
                "id": "payments",
                "category": "Payment System",
                "content": (
                    "Members can purchase membership plans using the integrated "
                    "online payment system. After successful payment, the membership "
                    "becomes active and remains valid until its expiry date."
                )
            },
            {
                "id": "user_roles",
                "category": "User Roles",
                "content": (
                    "The system supports three main user roles: Admin, Member, and Trainer. "
                    "Admins manage members, trainers, membership plans, and payments. "
                    "Members can purchase plans, request trainers, and view workout "
                    "and diet plans. Trainers manage assigned members and update "
                    "their workout and diet schedules."
                )
            },
            {
                "id": "member_management",
                "category": "Member Management",
                "content": (
                    "The system stores complete member information including personal "
                    "details, contact information, membership status, and fitness goals. "
                    "Admins can manage member records efficiently."
                )
            },
            {
                "id": "trainer_management",
                "category": "Trainer Management",
                "content": (
                    "The system maintains trainer profiles including their experience, "
                    "specialization, certifications, and assigned members. "
                    "Admins can manage trainer information and assignments."
                )
            },
            {
                "id": "trainer_requests",
                "category": "Trainer Requests",
                "content": (
                    "Members can request a personal trainer based on their fitness goals. "
                    "Trainer requests are reviewed and can be accepted or rejected."
                )
            },
            {
                "id": "workout_plans",
                "category": "Workout Plans",
                "content": (
                    "Personalized workout plans are prepared by trainers for their "
                    "assigned members. Members can access their latest workout schedule "
                    "from their dashboard."
                )
            },
            {
                "id": "diet_plans",
                "category": "Diet Plans",
                "content": (
                    "Trainers create personalized diet plans according to each member's "
                    "health goals and fitness requirements. Members can view their "
                    "assigned diet plans anytime."
                )
            },
            {
                "id": "membership_management",
                "category": "Membership Management",
                "content": (
                    "The system maintains complete membership records including "
                    "selected plan, start date, expiry date, payment status, "
                    "and membership status."
                )
            },
            {
                "id": "dashboard",
                "category": "Dashboard",
                "content": (
                    "The application provides separate dashboards for Admins, Members, "
                    "and Trainers. Each dashboard displays information relevant to "
                    "the user's role."
                )
            }
        ]

    def retrieve_context(self, query: str, top_k: int = 3) -> str:
        """
        Retrieve the most relevant knowledge snippets using
        simple keyword matching.
        """

        query_words = set(re.findall(r"\w+", query.lower()))

        if not query_words:
            return ""

        scored_docs = []

        for doc in self.documents:
            text = (doc["category"] + " " + doc["content"]).lower()
            doc_words = set(re.findall(r"\w+", text))

            # Base score using matching keywords
            matches = query_words.intersection(doc_words)
            score = len(matches)

            # Boost if query words appear in category
            for word in query_words:
                if word in doc["category"].lower():
                    score += 2

            if score > 0:
                scored_docs.append((score, doc["content"]))

        # Sort by relevance
        scored_docs.sort(key=lambda item: item[0], reverse=True)

        # Return top matching snippets
        top_snippets = [doc[1] for doc in scored_docs[:top_k]]

        if top_snippets:
            return "\n---\n".join(top_snippets)

        # Default fallback
        return (
            "The Health Club Management System helps manage members, trainers, "
            "membership plans, payments, workout plans, diet plans, and trainer assignments."
        )


# Singleton instance
rag_knowledge_base = RAGKnowledgeBase()