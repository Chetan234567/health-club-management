"""
File Path: python-chatbot-service/database.py
Description: Database connection and session management module using SQLAlchemy.
Spring Boot Equivalence: Equivalent to application.yml spring.datasource and JPA EntityManager config.
Database: Defaults to SQLite (sqlite:///./health_club_chatbot.db) or configurable MySQL/PostgreSQL URL.
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./health_club_chatbot.db")

# SQLite requires check_same_thread=False for multi-threaded FastAPI access
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency generator yielding an independent SQLAlchemy database session per HTTP request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
