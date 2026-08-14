"""
File Path: ChatBot_HCMS/main.py
Description: Health Club Management System (HCMS) AI Assistant Microservice with Secure Environment Variables.
Port: 8090 (configurable via PORT env variable).
"""

import os
import re
import uuid
import jwt
import requests
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager
from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

from database import Base, engine, get_db, SessionLocal
from models import ChatConversation, ChatMessage
from sqlalchemy.orm import Session

load_dotenv()

# ── Environment Variables ──────────────────────────────────────────────────────
JWT_SECRET  = os.getenv("JWT_SECRET", "HealthClubSuperSecureSecretKey2026WithAtLeast32BytesLength!")
CORE_SERVICE_INTERNAL_URL = os.getenv("CORE_SERVICE_INTERNAL_URL", "http://localhost:8081")
SERVICE_SECRET = os.getenv("SERVICE_SECRET", "InternalServiceSecretKey2026!")
GROQ_API_KEY   = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL     = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager creating database tables and validating environment configuration.
    """
    try:
        Base.metadata.create_all(bind=engine)
        print("✓ Health Club Chatbot database schema initialized successfully.")
    except Exception as e:
        print(f"Database schema init warning: {e}")

    # Startup Security Validation Check
    if not GROQ_API_KEY:
        print("⚠️ SECURITY NOTICE: GROQ_API_KEY is not set in environment variables! Supply GROQ_API_KEY at runtime for AI completion features.")
    else:
        print("✓ Groq API Key detected from environment configuration.")
    yield


app = FastAPI(
    title="HCMS Python AI Assistant Service",
    version="4.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialise Groq client
try:
    groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
except Exception as e:
    print(f"Groq init notice: {e}")
    groq_client = None


# ── System Prompt Template ──────────────────────────────────────────────────
BASE_SYSTEM_PROMPT = """You are Health Club Assistant, an empathetic, clear, highly accurate, and direct AI assistant for the Health Club Management System (HCMS).

CRITICAL INSTRUCTIONS:
1. Always give DIRECT, ACCURATE, and RELEVANT answers matching the user's specific question.
2. If REAL-TIME LIVE DATABASE CONTEXT is provided below, prioritize it over static memory to deliver 100% accurate live plan pricing and member data from the database.
3. Keep answers structured with clean, short bullet points (3 to 5 bullet points).
4. Answer strictly based on Health Club Management System (HCMS) domain rules and live database context.

• Single Active Subscription Lock: Members can hold strictly ONE active membership plan at a time. Purchasing while active throws SubscriptionConflictException.
• Online Payments: Integrated online payment gateway (Razorpay). Verified payments update status to SUCCESS and activate membership immediately.
• User Roles: Admin (manages members, trainers, plans, payments, reports), Member (purchases plans, requests trainers, views workouts/diets), Trainer (accepts/rejects requests, updates workout & diet schedules).
• Trainer Requests: Submitted by members (status: PENDING -> ACCEPTED/REJECTED). Assigned trainer updates personalized workout and diet JSON plans.
"""


PROHIBITED_REGEX = re.compile(
    r"(?i)(select\s+.*?\s+from|drop\s+table|dump\s+database|show\s+users|"
    r"system\s+prompt|ignore\s+instructions|jwt_secret|api_key|groq|password\s+hash|"
    r"other\s+member|all\s+payments|other\s+applicant|show\s+all\s+data)"
)


def verify_jwt_token(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization:
        return {"sub": "guest@healthclub.com", "userId": 1, "role": "MEMBER"}
    token = authorization.replace("Bearer ", "").strip()
    try:
        payload = jwt.decode(
            token, JWT_SECRET,
            algorithms=["HS256", "HS384", "HS512"],
            options={"verify_signature": False}
        )
        return payload
    except Exception as e:
        print(f"JWT decode warning: {e}")
        return {"sub": "guest@healthclub.com", "userId": 1, "role": "MEMBER"}


def fetch_live_backend_context(user_text: str, member_user_id: int) -> str:
    """Dynamically fetches real-time database data from Spring Boot Core Backend (port 8081)."""
    context_blocks = []
    headers = {"X-Service-Token": SERVICE_SECRET}
    lower = user_text.lower()

    # 1. Fetch Logged-in Member Profile Real-time Data
    if any(k in lower for k in ["status", "my plan", "my membership", "renewal", "my trainer", "my workout", "my diet", "profile"]):
        try:
            res = requests.get(f"{CORE_SERVICE_INTERNAL_URL}/api/members/{member_user_id}", headers=headers, timeout=2)
            if res.status_code == 200:
                data = res.json()
                m_data = data.get("data", data)
                context_blocks.append(
                    f"LIVE MEMBER PROFILE (User #{member_user_id}):\n"
                    f"- Full Name: {m_data.get('fullName', 'N/A')}\n"
                    f"- Status: {m_data.get('status', 'Pending')}\n"
                    f"- Active Plan: {m_data.get('planName', 'None')}\n"
                    f"- Renewal Date: {m_data.get('renewalDate', 'N/A')}\n"
                    f"- Assigned Trainer: {m_data.get('trainerName', 'Not Assigned')}\n"
                    f"- Workout Schedule JSON: {m_data.get('workoutPlanJson', 'Not Set')}\n"
                    f"- Diet Plan JSON: {m_data.get('dietPlanJson', 'Not Set')}"
                )
        except Exception as e:
            print(f"Live member fetch notice: {e}")

    # 2. Fetch All Members Roster Real-time Data
    if any(k in lower for k in ["member", "user", "client", "who is", "details of", "person", "sangram", "gangane", "all members"]):
        try:
            res = requests.get(f"{CORE_SERVICE_INTERNAL_URL}/api/members", headers=headers, timeout=2)
            if res.status_code == 200:
                m_list_data = res.json()
                m_list = m_list_data.get("data", m_list_data)
                if isinstance(m_list, list):
                    m_lines = []
                    for m in m_list:
                        m_lines.append(
                            f"• Member #{m.get('id')}: {m.get('fullName')} | Email: {m.get('email')} | Plan: {m.get('planName', 'None')} | Trainer: {m.get('trainerName', 'Not Assigned')} | Status: {m.get('status')} | Renewal: {m.get('renewalDate', 'N/A')}"
                        )
                    context_blocks.append("LIVE MEMBERS ROSTER DATABASE DATA:\n" + "\n".join(m_lines))
        except Exception as e:
            print(f"Live all members fetch notice: {e}")

    # 3. Fetch Live Membership Plans Real-time Data
    if any(k in lower for k in ["plan", "price", "cost", "tier", "subscription", "membership", "package", "duration"]):
        try:
            res = requests.get(f"{CORE_SERVICE_INTERNAL_URL}/api/plans", headers=headers, timeout=2)
            if res.status_code == 200:
                plans_data = res.json()
                plans_list = plans_data.get("data", plans_data)
                if isinstance(plans_list, list):
                    plan_lines = []
                    for p in plans_list:
                        price_str = p.get('price', '') or f"₹{p.get('priceInr', '')}"
                        features_str = ", ".join(p.get('features', [])) if isinstance(p.get('features'), list) else ""
                        plan_lines.append(f"• {p.get('name')}: Price {price_str}, Duration {p.get('duration')}, Features: {features_str}, Active Members {p.get('members', 0)}")
                    context_blocks.append("LIVE MEMBERSHIP PLANS DATABASE DATA (FROM MYSQL DATABASE):\n" + "\n".join(plan_lines))
        except Exception as e:
            print(f"Live plans fetch notice: {e}")

    # 4. Fetch Live Trainers Real-time Data
    if any(k in lower for k in ["trainer", "coach", "specialist", "staff", "instructor", "nisha", "kabir", "meera", "arjun"]):
        try:
            res = requests.get(f"{CORE_SERVICE_INTERNAL_URL}/api/trainers", headers=headers, timeout=2)
            if res.status_code == 200:
                t_data = res.json()
                t_list = t_data.get("data", t_data)
                if isinstance(t_list, list):
                    trainer_lines = []
                    for t in t_list:
                        trainer_lines.append(f"• Trainer #{t.get('id')}: {t.get('fullName', t.get('name'))} | Specialization: {t.get('specialty', t.get('specialization'))} | Clients: {t.get('activeClients', t.get('assignedClientsCount', 0))} | Rating: {t.get('rating', '5.0')}")
                    context_blocks.append("LIVE TRAINERS DATABASE DATA:\n" + "\n".join(trainer_lines))
        except Exception as e:
            print(f"Live trainers fetch notice: {e}")

    return "\n\n".join(context_blocks)


def load_conversation_history(db: Session, conv_id: int, limit: int = 6) -> List[Dict]:
    if not conv_id or conv_id <= 0:
        return []
    try:
        rows = db.query(ChatMessage).filter(ChatMessage.conversation_id == conv_id).order_by(ChatMessage.created_at.desc()).limit(limit).all()
        messages = []
        for row in reversed(rows):
            role = "user" if row.sender in ["MEMBER", "PARENT", "USER"] else "assistant"
            messages.append({"role": role, "content": row.message_text})
        return messages
    except Exception as e:
        print(f"History load warning: {e}")
        return []


def call_groq(user_message: str, history: List[Dict], live_context: str = "") -> str:
    # Re-initialize client if key provided dynamically at runtime
    current_key = os.getenv("GROQ_API_KEY", "")
    client = groq_client
    if not client and current_key:
        client = Groq(api_key=current_key)

    if not client:
        raise Exception("GROQ_API_KEY environment variable is missing. Please supply GROQ_API_KEY at runtime.")

    system_prompt = BASE_SYSTEM_PROMPT
    if live_context and len(live_context.strip()) > 0:
        system_prompt += f"\n\nREAL-TIME LIVE DATABASE CONTEXT (FROM SPRING BOOT BACKEND):\n{live_context}"

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})

    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=messages,
        temperature=0.2,
        max_tokens=400,
        top_p=1,
        stream=False,
    )
    return completion.choices[0].message.content.strip()


def get_appropriate_fallback_response(user_text: str, live_context: str = "") -> str:
    """Concise and accurate topic-matched fallback answer for HCMS domain."""
    if live_context and len(live_context.strip()) > 0:
        return f"📌 **Real-time Live Database Data**:\n\n{live_context}"

    lower = user_text.lower()
    if any(k in lower for k in ["plan", "tier", "subscription", "membership"]):
        return (
            "💳 **HCMS Membership Plans & Rules**:\n\n"
            "• **Monthly Gym** (30 days): Gym floor access & standard locker\n"
            "• **Strength Pro** (90 days): Assigned trainer & custom workout routine\n"
            "• **Yoga Plus** (180 days): Yoga routine & tailored diet plan\n"
            "• **Cardio Elite** (180 days): Heart-rate cardio tracking & endurance schedule\n"
            "• **Elite Annual / VIP Annual** (365 days): All-access priority booking & dedicated trainer\n\n"
            "⚠️ **Single Active Rule**: A member can strictly hold only ONE active membership at a time."
        )

    if any(k in lower for k in ["payment", "razorpay", "checkout", "order", "verify", "pay"]):
        return (
            "🔐 **Online Payments**:\n\n"
            "• Members can purchase membership plans using the integrated online payment system.\n"
            "• Upon successful payment verification, payment status updates to SUCCESS and membership activates immediately."
        )

    if any(k in lower for k in ["trainer", "request", "assign", "coach"]):
        return (
            "🏋️ **Trainer Request Lifecycle**:\n\n"
            "• Members submit requests specifying fitness goals (status: `PENDING`).\n"
            "• Assigned trainer accepts or rejects the request (`ACCEPTED` / `REJECTED`).\n"
            "• Upon acceptance, the trainer creates and updates custom workout and diet plans."
        )

    return (
        "Welcome to Health Club AI Assistant!\n\n"
        "Ask me about **Membership Plans**, **Payments**, **Trainer Requests**, or **Workout & Diet Plans**."
    )


def generate_ai_response(db: Session, user_text: str, member_user_id: int, conv_id: int) -> tuple[str, bool]:
    # 1. Security check
    if PROHIBITED_REGEX.search(user_text):
        return (
            "I am strictly here to assist with Health Club Management System (HCMS) plans, payments, trainer requests, and schedules.",
            True
        )

    # 2. Fetch Live Database Context from Spring Boot Backend (Port 8081)
    live_context = fetch_live_backend_context(user_text, member_user_id)

    # 3. Primary: Try Groq LLM with live backend context
    try:
        history = load_conversation_history(db, conv_id, limit=6)
        reply = call_groq(user_text, history, live_context)
        if reply and len(reply.strip()) > 0:
            return reply, False
    except Exception as e:
        print(f"Groq LLM call notice: {e}")

    # 4. Fallback: Topic-matched appropriate response with live context
    return get_appropriate_fallback_response(user_text, live_context), False


# ─────────────────────────────────────────────────────────────────────────────
# API Models & Routes
# ─────────────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    sessionId: Optional[str] = None
    conversationId: Optional[int] = None
    userId: Optional[int] = 1
    roleName: Optional[str] = "member"
    message: str

class ChatResponse(BaseModel):
    sessionId: Optional[str] = None
    conversationId: Optional[int] = None
    reply: str
    wasRedacted: Optional[bool] = False


@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "HCMS Python AI Assistant Service",
        "model": GROQ_MODEL,
        "apiKeyConfigured": bool(os.getenv("GROQ_API_KEY"))
    }


@app.get("/")
def root_status():
    return {
        "application": "HCMS Python AI Assistant Service",
        "status": "RUNNING",
        "port": int(os.getenv("PORT", "8090")),
        "chatApi": "/api/assistant/chat",
        "framework": "FastAPI (Python 3)"
    }


@app.post("/api/assistant/chat", response_model=ChatResponse)
@app.post("/api/chatbot/chat", response_model=ChatResponse)
def chat(req: ChatRequest, db: Session = Depends(get_db), user_payload: Dict[str, Any] = Depends(verify_jwt_token)):
    member_user_id = req.userId or user_payload.get("userId") or 1
    session_id     = req.sessionId or str(uuid.uuid4())
    conv_id        = req.conversationId

    # 1. Retrieve or create ChatConversation thread in DB via SQLAlchemy ORM
    if not conv_id:
        conv = db.query(ChatConversation).filter(ChatConversation.session_id == session_id).first()
        if conv:
            conv_id = conv.id
        else:
            conv = ChatConversation(
                parent_id=member_user_id,
                session_id=session_id,
                started_at=datetime.utcnow()
            )
            db.add(conv)
            db.commit()
            db.refresh(conv)
            conv_id = conv.id

    # 2. Generate AI reply with live real-time backend data
    reply_text, was_redacted = generate_ai_response(db, req.message, member_user_id, conv_id or 0)

    # 3. Save ChatMessage history to DB via SQLAlchemy ORM
    try:
        user_msg = ChatMessage(
            conversation_id=conv_id,
            sender="MEMBER",
            message_text=req.message,
            was_redacted=was_redacted
        )
        assistant_msg = ChatMessage(
            conversation_id=conv_id,
            sender="ASSISTANT",
            message_text=reply_text,
            was_redacted=was_redacted
        )
        db.add(user_msg)
        db.add(assistant_msg)

        conv_obj = db.query(ChatConversation).filter(ChatConversation.id == conv_id).first()
        if conv_obj:
            conv_obj.last_message_at = datetime.utcnow()

        db.commit()
    except Exception as e:
        print(f"DB notice (message save): {e}")
        db.rollback()

    return ChatResponse(
        sessionId=session_id,
        conversationId=conv_id,
        reply=reply_text,
        wasRedacted=was_redacted
    )


@app.get("/api/assistant/history")
def get_history(db: Session = Depends(get_db), user_payload: Dict[str, Any] = Depends(verify_jwt_token)):
    member_user_id = user_payload.get("userId") or 1
    try:
        convs = db.query(ChatConversation).filter(ChatConversation.parent_id == member_user_id).order_by(ChatConversation.started_at.desc()).all()
        history = []
        for c in convs:
            msgs = db.query(ChatMessage).filter(ChatMessage.conversation_id == c.id).order_by(ChatMessage.created_at.asc()).all()
            history.append({
                "sessionId": c.session_id,
                "startedAt": c.started_at.isoformat() if c.started_at else None,
                "messages": [
                    {
                        "id": m.id,
                        "sender": m.sender,
                        "messageText": m.message_text,
                        "wasRedacted": m.was_redacted,
                        "createdAt": m.created_at.isoformat() if m.created_at else None
                    } for m in msgs
                ]
            })
        return history
    except Exception as err:
        print(f"Error fetching history: {err}")
        return []


@app.delete("/api/assistant/history/{sessionId}")
def delete_session(sessionId: str, db: Session = Depends(get_db), user_payload: Dict[str, Any] = Depends(verify_jwt_token)):
    try:
        conv = db.query(ChatConversation).filter(ChatConversation.session_id == sessionId).first()
        if conv:
            db.delete(conv)
            db.commit()
        return {"message": "Session history deleted successfully"}
    except Exception as err:
        return {"message": f"Failed to delete session: {err}"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8090"))
    print(f"🚀 Starting HCMS Python AI Assistant Service on http://0.0.0.0:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
