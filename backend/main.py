"""
FastAPI backend for the CBSE RAG app.

Run with:
    uvicorn main:app --reload --port 8000
"""

import os
from pathlib import Path
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()  # Load .env before anything else

from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import json
import ollama
from database import db

import rag
import database
import content_library
from auth import get_current_user

CHAT_MODEL = os.getenv("CHAT_MODEL", "mistral")

PDF_PATH = os.getenv("PDF_PATH", "deev101.pdf")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")


# ── Startup / Shutdown ────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[SERVER] Loading PDF and building index...")
    rag.startup(PDF_PATH)
    print("[SERVER] Ready!")
    yield
    print("[SERVER] Shutting down.")

app = FastAPI(title="CBSE RAG API", lifespan=lifespan)


# ── CORS (allow React dev server) ─────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ─────────────────────────────

class AskRequest(BaseModel):
    question: str
    mode: str | None = None
    debug: bool = False
    content_id: str | None = None


class AskResponse(BaseModel):
    answer: str
    question: str
    history_id: str | None = None
    sources: list[dict] | None = None
    graph_used: bool | None = None
    graph_chunks_count: int | None = None


class SummaryResponse(BaseModel):
    summary: str


class HistoryResponse(BaseModel):
    history: list[dict]


class TeachResponse(BaseModel):
    lesson: str


class QuizResponse(BaseModel):
    quiz: dict


class QuizAttemptRequest(BaseModel):
    score: int
    total: int
    breakdown: dict | None = None


class ProgressResponse(BaseModel):
    questions_asked: int
    quiz_attempts: int
    best_quiz_score: int | None = None


class IngestResponse(BaseModel):
    ok: bool
    files: list[str]
    chunks_loaded: int


class FeedbackRequest(BaseModel):
    history_id: str
    rating: int
    note: str | None = None


class FeedbackResponse(BaseModel):
    ok: bool


class CuriosityRequest(BaseModel):
    history_id: str


class CuriosityResponse(BaseModel):
    suggestions: list[str]


# Constants
CHAT_MODEL = os.getenv("CHAT_MODEL", "mistral")


# ── Routes ────────────────────────────────────────────────

def _ensure_content_loaded(content_id: str | None) -> None:
    """Optionally switch the active chapter/content set for this request."""
    cid = (content_id or "").strip()
    if not cid:
        return
    try:
        abs_path, store_key = content_library.resolve_content_id(cid)
        rag.load_content(abs_path, store_key=store_key)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid content_id: {e}")


@app.get("/content/library")
def get_content_library(user=Depends(get_current_user)):
    """List available subjects + chapters (PDF/PPTX) from the server's content folders. Auth required."""
    return content_library.list_library()

@app.get("/health")
def health():
    """Quick check — is the server alive?"""
    return {
        "status": "ok",
        "chunks_loaded": len(rag.texts),
        "graph_rag": rag.graph_stats(),
        "content": {
            "path": rag.CURRENT_CONTENT_PATH,
            "store_key": rag.CURRENT_STORE_KEY,
        },
    }


@app.get("/graph/stats")
def get_graph_stats(content_id: str | None = None, user=Depends(get_current_user)):
    """Returns knowledge graph statistics. Auth required."""
    _ensure_content_loaded(content_id)
    return rag.graph_stats()


@app.get("/graph/export")
def export_graph(
    max_nodes: int = 250,
    max_edges: int = 800,
    content_id: str | None = None,
    user=Depends(get_current_user),
):
    """Exports the knowledge graph (nodes + edges) for frontend visualization. Auth required."""
    _ensure_content_loaded(content_id)
    return rag.graph_export(max_nodes=max_nodes, max_edges=max_edges)


@app.post("/ingest", response_model=IngestResponse)
async def ingest(
    files: list[UploadFile] = File(...),
    reset: bool = False,
    rebuild_summary: bool = False,
    user=Depends(get_current_user),
):
    """Upload PDFs/PPTX and ingest them into the RAG index. Auth required."""
    upload_dir = Path(UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    saved_paths: list[str] = []
    for f in files:
        name = (f.filename or "").strip()
        if not name:
            continue
        ext = Path(name).suffix.lower()
        if ext not in {".pdf", ".pptx"}:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {name}")

        dest = upload_dir / Path(name).name
        data = await f.read()
        if not data:
            continue
        dest.write_bytes(data)
        saved_paths.append(str(dest.resolve()))

    if not saved_paths:
        raise HTTPException(status_code=400, detail="No valid files uploaded.")

    try:
        rag.ingest_paths(saved_paths, reset=reset, rebuild_summary=rebuild_summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingest failed: {e}")

    return {"ok": True, "files": [Path(p).name for p in saved_paths], "chunks_loaded": len(rag.texts)}


@app.get("/summary", response_model=SummaryResponse)
def get_summary(content_id: str | None = None, user=Depends(get_current_user)):
    """Returns the pre-built chapter summary. Auth required."""
    _ensure_content_loaded(content_id)
    if not rag.final_summary:
        raise HTTPException(status_code=503, detail="Summary not ready yet.")
    return {"summary": rag.final_summary}


@app.post("/ask", response_model=AskResponse)
def ask(body: AskRequest, user=Depends(get_current_user)):
    """
    Takes a question, returns an answer using RAG + mistral.
    Saves the Q&A to Supabase for history. Auth required.
    """
    q = body.question.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    _ensure_content_loaded(body.content_id)

    try:
        result = rag.answer(q, mode=body.mode, debug=body.debug)
    except ConnectionError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        print(f"[WARN] Answer generation failed: {e}")
        raise HTTPException(status_code=503, detail="Answer generation failed. Is Ollama running?")

    ans = result.get("answer", "")

    # Save to DB (non-blocking — don't fail the request if DB write fails)
    history_id = None
    try:
        history_id = database.save_message(user["id"], q, ans)
    except Exception as e:
        print(f"[WARN] Failed to save history: {e}")

    if body.debug:
        return {"question": q, "answer": ans, "history_id": history_id,
                "sources": result.get("sources", []),
                "graph_used": result.get("graph_used", False),
                "graph_chunks_count": result.get("graph_chunks_count", 0)}
    return {"question": q, "answer": ans, "history_id": history_id,
            "graph_used": result.get("graph_used", False),
            "graph_chunks_count": result.get("graph_chunks_count", 0)}


@app.post("/feedback", response_model=FeedbackResponse)
def feedback(body: FeedbackRequest, user=Depends(get_current_user)):
    """Store thumbs up/down feedback for an assistant answer. Auth required."""
    if body.rating not in (-1, 1):
        raise HTTPException(status_code=400, detail="rating must be 1 or -1")
    history_id = (body.history_id or "").strip()
    if not history_id:
        raise HTTPException(status_code=400, detail="history_id is required")

    try:
        database.save_feedback(user["id"], history_id, body.rating, body.note)
    except Exception as e:
        print(f"[WARN] Failed to save feedback: {e}")
        raise HTTPException(status_code=503, detail="chat_feedback table not configured in Supabase")
    return {"ok": True}


@app.get("/history", response_model=HistoryResponse)
def get_history(user=Depends(get_current_user)):
    """Returns the logged-in user's past Q&A. Auth required."""
    try:
        history = database.get_history(user["id"])
    except Exception as e:
        print(f"[WARN] Failed to fetch history: {e}")
        history = []
    return {"history": history}


@app.delete("/history/{history_id}")
def delete_history_entry(history_id: str, user=Depends(get_current_user)):
    """Deletes a specific history entry."""
    try:
        database.delete_history_item(user["id"], history_id)
        return {"ok": True}
    except Exception as e:
        print(f"[WARN] Failed to delete history: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete history")


@app.get("/curiosity/{history_id}", response_model=CuriosityResponse)
def get_curiosity(history_id: str, user=Depends(get_current_user)):
    """Generate 3 context-specific follow-up questions based on chat history. Auth required."""
    if not history_id:
        raise HTTPException(status_code=400, detail="history_id required")

    # Fetch the specific history entry
    res = (
        db.table("chat_history")
        .select("question, answer")
        .eq("id", history_id)
        .eq("user_id", user["id"])
        .execute()
    )
    data = res.data or []
    if not data:
        raise HTTPException(status_code=404, detail="History entry not found")

    entry = data[0]
    question = entry.get("question", "")
    answer = entry.get("answer", "")

    context = f"Previous question: {question}\nPrevious answer: {answer}"

    # Don't waste tokens if the bot had no answer
    if "couldn't find" in answer.lower() or "not found" in answer.lower():
        return {"suggestions": [
            f"Can you explain more about {question.split()[0] if question else 'this'}?",
            "What chapter does this topic come from?",
            "Can you give a simple example?",
        ]}

    prompt = f"""You are a CBSE tutor helper. Based on this Q&A, write exactly 3 short follow-up questions a student might ask next.

Rules:
- Specific to the context below, not generic.
- Child-friendly for classes 1-5.
- Short (under 10 words each).
- Output ONLY a JSON array on one line, like: ["q1", "q2", "q3"]
- No markdown, no explanation, just the array.

Context:
Q: {question}
A: {answer}

Output:"""

    import re
    try:
        res = ollama.chat(model=CHAT_MODEL, messages=[{"role": "user", "content": prompt}])
        raw = res['message']['content'].strip()
        print(f"[DEBUG] Curiosity raw: {raw!r}")
        # Extract JSON array from anywhere in the response
        match = re.search(r'\[.*?\]', raw, re.DOTALL)
        if match:
            suggestions = json.loads(match.group())
            if isinstance(suggestions, list) and len(suggestions) >= 1:
                # Pad if fewer than 3
                while len(suggestions) < 3:
                    suggestions.append("Can you explain more?")
                suggestions = suggestions[:3]
            else:
                raise ValueError("Not a valid list")
        else:
            raise ValueError("No array found in response")
    except Exception as e:
        print(f"[WARN] Curiosity generation failed: {e}")
        # Generate context-specific fallbacks from the question words
        topic = ' '.join(question.split()[:3]) if question else "this topic"
        suggestions = [
            f"Tell me more about {topic}.",
            "Can you give a real-life example?",
            "Why is this important to learn?",
        ]

    return {"suggestions": suggestions[:3]}


@app.get("/teach", response_model=TeachResponse)
def teach(content_id: str | None = None, user=Depends(get_current_user)):
    """Teacher-style lesson generated from the chapter summary. Auth required."""
    _ensure_content_loaded(content_id)
    if not rag.final_summary:
        raise HTTPException(status_code=503, detail="Summary not ready yet.")
    try:
        lesson = rag.teach()
        return {"lesson": lesson}
    except Exception as e:
        print(f"[WARN] Teach generation failed: {e}")
        raise HTTPException(status_code=503, detail="Lesson generation failed. Is Ollama running?")


@app.get("/teach/structured")
def teach_structured(content_id: str | None = None, user=Depends(get_current_user)):
    """Structured lesson as JSON with sections for rich UI. Auth required."""
    _ensure_content_loaded(content_id)
    if not rag.final_summary:
        raise HTTPException(status_code=503, detail="Summary not ready yet.")
    try:
        lesson = rag.teach_structured()
        return lesson
    except Exception as e:
        print(f"[WARN] Structured teach generation failed: {e}")
        raise HTTPException(status_code=503, detail="Structured lesson generation failed. Is Ollama running?")


@app.get("/quiz", response_model=QuizResponse)
def quiz(content_id: str | None = None, user=Depends(get_current_user)):
    """Generate a child-friendly quiz from the chapter content. Auth required."""
    _ensure_content_loaded(content_id)
    if not rag.final_summary:
        raise HTTPException(status_code=503, detail="Summary not ready yet.")
    try:
        return {"quiz": rag.generate_quiz()}
    except Exception as e:
        print(f"[WARN] Quiz generation failed: {e}")
        raise HTTPException(status_code=503, detail="Quiz generation failed. Is Ollama running and returning JSON?")


@app.post("/quiz/attempt")
def save_quiz_attempt(body: QuizAttemptRequest, user=Depends(get_current_user)):
    """Persist a quiz attempt for basic progress tracking. Auth required."""
    try:
        database.save_quiz_attempt(user["id"], body.score, body.total, body.breakdown)
    except Exception as e:
        print(f"[WARN] Failed to save quiz attempt: {e}")
        raise HTTPException(status_code=503, detail="quiz_attempts table not configured in Supabase")
    return {"ok": True}


@app.get("/progress", response_model=ProgressResponse)
def progress(user=Depends(get_current_user)):
    """Basic progress stats. Auth required."""
    questions_asked = 0
    quiz_attempts = 0
    best_quiz_score = None

    try:
        questions_asked = database.get_question_count(user["id"])
    except Exception as e:
        print(f"[WARN] Failed to compute question count: {e}")

    try:
        stats = database.get_quiz_stats(user["id"])
        quiz_attempts = stats.get("quiz_attempts", 0)
        best_quiz_score = stats.get("best_quiz_score")
    except Exception as e:
        print(f"[WARN] Failed to compute quiz stats: {e}")

    return {
        "questions_asked": questions_asked,
        "quiz_attempts": quiz_attempts,
        "best_quiz_score": best_quiz_score,
    }