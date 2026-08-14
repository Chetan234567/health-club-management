"""
File Path: python-chatbot-service/schemas.py
Description: Pydantic schemas for request validation and response serialization.
Spring Boot Equivalence: Directly maps com.healthclub.chatbot.dto.ChatDtos (ChatRequest, ChatResponse).
"""
from typing import Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """
    Request payload schema for /api/chatbot/chat.
    Spring Boot Equivalent: ChatDtos.ChatRequest
    """
    conversationId: Optional[int] = Field(default=None, alias="conversationId")
    userId: Optional[int] = Field(default=None, alias="userId")
    roleName: Optional[str] = Field(default="member", alias="roleName")
    message: str = Field(..., min_length=1, description="Message content from user")

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "conversationId": None,
                "userId": 101,
                "roleName": "member",
                "message": "How do I upgrade my plan?"
            }
        }


class ChatResponse(BaseModel):
    """
    Response payload schema for /api/chatbot/chat.
    Spring Boot Equivalent: ChatDtos.ChatResponse
    """
    conversationId: int = Field(..., alias="conversationId")
    reply: str = Field(..., alias="reply")

    class Config:
        populate_by_name = True
