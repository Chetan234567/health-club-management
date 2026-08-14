"""
File Path: python-chatbot-service/services/rag_service.py

Description:
Simple Retrieval-Augmented Generation (RAG) Chatbot Service
for the Health Club Management System (HCMS).

Purpose:
- Retrieves relevant business knowledge based on user queries.
- Generates simple, context-aware chatbot responses.
"""

# Business Knowledge Base
RAG_KNOWLEDGE_BASE = {
    "plan":
        "The Health Club Management System offers multiple membership plans such as Monthly Gym, Strength Pro, Yoga Plus, Cardio Elite, Elite Annual, and VIP Annual.",

    "membership":
        "Members can choose from different membership plans based on their fitness goals and preferred duration.",

    "subscription":
        "A member can have only one active membership at a time. A new membership can be purchased only after the current membership expires.",

    "payment":
        "Members can purchase membership plans using the integrated online payment system. After successful payment, the membership becomes active.",

    "trainer":
        "Members can request personal trainers based on their fitness goals. Trainer requests can be accepted or rejected.",

    "workout":
        "Trainers prepare personalized workout plans for their assigned members.",

    "diet":
        "Trainers create customized diet plans according to each member's health goals and fitness requirements.",

    "role":
        "The system supports three user roles: Admin, Member, and Trainer. Each role has its own dashboard and responsibilities.",

    "admin":
        "Admins manage members, trainers, membership plans, payments, and overall system operations.",

    "member":
        "Members can purchase plans, request trainers, and view their workout and diet schedules.",

    "dashboard":
        "Separate dashboards are available for Admins, Members, and Trainers to access role-specific features.",

    "health":
        "The Health Club Management System helps manage gym memberships, trainers, workout plans, diet plans, payments, and member fitness activities."
}


class SimpleRAGChatbot:
    """
    Simple RAG Engine implementing:
    Retrieve -> Augment -> Generate
    """

    def retrieve_context(self, user_query: str) -> str:
        """
        Retrieve relevant knowledge by matching keywords
        with the knowledge base.
        """
        query_text = user_query.lower()
        matched_snippets = []

        for keyword, knowledge in RAG_KNOWLEDGE_BASE.items():
            if keyword in query_text:
                if knowledge not in matched_snippets:
                    matched_snippets.append(knowledge)

        if matched_snippets:
            return " ".join(matched_snippets)

        # Default response if no keyword matches
        return (
            "The Health Club Management System helps manage members, "
            "trainers, membership plans, payments, workout plans, "
            "diet plans, and trainer assignments."
        )

    def generate_response(self, role_name: str, user_query: str) -> str:
        """
        Generate a response using the retrieved knowledge.
        """
        context = self.retrieve_context(user_query)
        role = role_name or "Member"

        return (
            f"🤖 HCMS Assistant ({role.capitalize()})\n\n"
            f"{context}"
        )


# Singleton instance
simple_rag_chatbot = SimpleRAGChatbot()