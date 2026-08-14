"""
File Path: ChatBot_HCMS/models.py
Description: SQLAlchemy ORM entity models for Health Club Chatbot history & session persistence.
Tables: chatbot_conversations, chatbot_messages
"""
from datetime import datetime
from database import Base
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, Boolean
from sqlalchemy.orm import relationship


class ChatConversation(Base):
    """
    Model representing a chat thread session for a user or visitor role.
    """
    __tablename__ = "chatbot_conversations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    parent_id = Column(Integer, nullable=True, default=1)
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    last_message_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to ChatMessage
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan")


class ChatMessage(Base):
    """
    Model representing individual messages (MEMBER / USER or ASSISTANT) within a conversation thread.
    """
    __tablename__ = "chatbot_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    conversation_id = Column(Integer, ForeignKey("chatbot_conversations.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(20), nullable=False)  # "MEMBER", "USER", "ASSISTANT"
    message_text = Column(Text, nullable=False)
    was_redacted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to ChatConversation
    conversation = relationship("ChatConversation", back_populates="messages")
