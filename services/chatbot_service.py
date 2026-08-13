"""
File Path: ChatBot_HCMS/services/chatbot_service.py
Description: Service layer managing conversation sessions, message history persistence, and LangChain Agentic RAG AI orchestration.
"""
import uuid
from datetime import datetime
from models import ChatConversation, ChatMessage
from schemas import ChatRequest, ChatResponse
from services.rag_agent_service import agentic_rag_service
from sqlalchemy.orm import Session


class ChatbotService:
    """
    Business logic coordinator for chatbot threads and LangChain Agentic RAG history.
    """

    async def chat(self, request: ChatRequest, db: Session) -> ChatResponse:
        """
        Processes incoming chat message, manages thread entity, logs user message,
        generates reply via LangChain Agentic RAG engine, logs reply, and returns ChatResponse.
        """
        user_id = request.userId or 1
        conv_id = request.conversationId

        # 1. Retrieve or create conversation thread
        if conv_id:
            conversation = db.query(ChatConversation).filter(ChatConversation.id == conv_id).first()
            if not conversation:
                conversation = self._create_conversation(user_id, db)
        else:
            conversation = self._create_conversation(user_id, db)

        conv_id = conversation.id

        # 2. Load recent conversation history for memory context
        history_msgs = []
        try:
            recent_rows = db.query(ChatMessage).filter(ChatMessage.conversation_id == conv_id).order_by(ChatMessage.created_at.desc()).limit(6).all()
            for r in reversed(recent_rows):
                role = "user" if r.sender in ["MEMBER", "USER"] else "assistant"
                history_msgs.append({"role": role, "content": r.message_text})
        except Exception:
            history_msgs = []

        # 3. Save user message to database
        self._save_message(db, conv_id, "MEMBER", request.message)

        # 4. Generate Agentic RAG response from LangChain Agentic RAG Service
        reply_text = agentic_rag_service.process_query(
            role_name=request.roleName or "member",
            question=request.message,
            user_id=user_id,
            history=history_msgs
        )

        # 5. Save assistant response to database
        self._save_message(db, conv_id, "ASSISTANT", reply_text)

        conversation.last_message_at = datetime.utcnow()

        # 6. Commit transaction and return ChatResponse
        try:
            db.commit()
            db.refresh(conversation)
        except Exception as e:
            print(f"[ChatbotService Warning] DB commit notice: {e}")
            db.rollback()

        return ChatResponse(conversationId=conversation.id, reply=reply_text)

    def _create_conversation(self, user_id: int, db: Session) -> ChatConversation:
        """Helper method creating a new ChatConversation thread in DB."""
        session_id = str(uuid.uuid4())
        conversation = ChatConversation(
            parent_id=user_id,
            session_id=session_id,
            started_at=datetime.utcnow()
        )
        db.add(conversation)
        db.flush()
        return conversation

    def _save_message(self, db: Session, conversation_id: int, sender: str, message: str) -> ChatMessage:
        """Helper method appending a ChatMessage record to the database."""
        chat_message = ChatMessage(
            conversation_id=conversation_id,
            sender=sender,
            message_text=message,
            was_redacted=False
        )
        db.add(chat_message)
        return chat_message


# Singleton instance
chatbot_service = ChatbotService()
