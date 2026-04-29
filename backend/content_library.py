from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Chapter:
    id: str
    filename: str
    label: str


@dataclass(frozen=True)
class Subject:
    id: str
    name: str
    dir: Path


def _backend_root() -> Path:
    return Path(__file__).resolve().parent


def get_subjects() -> list[Subject]:
    root = _backend_root()
    # Keep IDs stable + URL-safe.
    return [
        Subject(id="evs", name="EVS", dir=root / "EVS"),
        Subject(id="math", name="Math", dir=root / "maths"),
    ]


def list_library() -> dict:
    subjects_out: list[dict] = []

    for subj in get_subjects():
        chapters: list[dict] = []
        if subj.dir.exists() and subj.dir.is_dir():
            for p in sorted(subj.dir.glob("*.pdf")):
                chapters.append(
                    {
                        "id": f"{subj.id}/{p.name}",
                        "filename": p.name,
                        "label": p.stem,
                    }
                )
            for p in sorted(subj.dir.glob("*.pptx")):
                chapters.append(
                    {
                        "id": f"{subj.id}/{p.name}",
                        "filename": p.name,
                        "label": p.stem,
                    }
                )

        subjects_out.append(
            {
                "id": subj.id,
                "name": subj.name,
                "chapters": chapters,
            }
        )

    return {"subjects": subjects_out}


def resolve_content_id(content_id: str) -> tuple[str, str]:
    """Resolve a content_id like 'evs/deev101.pdf' into an absolute file path.

    Returns (abs_path, store_key).
    """
    content_id = (content_id or "").strip().replace("\\", "/")
    if not content_id or "/" not in content_id:
        raise ValueError("content_id must look like '<subject>/<filename>'")

    subject_id, filename = content_id.split("/", 1)
    subject_id = subject_id.strip().lower()
    filename = filename.strip()
    if not filename or "/" in filename or ".." in filename:
        raise ValueError("Invalid content_id")

    subject_by_id = {s.id: s for s in get_subjects()}
    subj = subject_by_id.get(subject_id)
    if subj is None:
        raise ValueError(f"Unknown subject: {subject_id}")

    ext = Path(filename).suffix.lower()
    if ext not in {".pdf", ".pptx"}:
        raise ValueError("Unsupported file type")

    p = (subj.dir / filename).resolve()
    # Ensure p is inside subj.dir.
    subj_dir = subj.dir.resolve()
    if subj_dir not in p.parents:
        raise ValueError("Invalid content_id")
    if not p.exists() or not p.is_file():
        raise ValueError("Chapter file not found")

    # Use a stable, filesystem-safe cache key.
    store_key = f"{subj.id}_{p.stem}".lower().replace(" ", "_")
    return str(p), store_key
