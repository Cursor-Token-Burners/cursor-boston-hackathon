from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


class ACLKnowledgeError(Exception):
    """Raised when ACL knowledge base loading or retrieval fails."""


@dataclass(frozen=True)
class KnowledgeSnippet:
    """Represents a retrieved rehab context snippet for response grounding."""

    title: str
    body: str


def _repo_root() -> Path:
    """Return repository root from the current module path."""
    return Path(__file__).resolve().parent.parent.parent


def load_acl_rehab_text() -> str:
    """
    Load the ACL rehab knowledge document.

    The backend uses this text as a lightweight RAG source to ground "next step"
    messaging and avoid purely free-form generation for rehab guidance.
    """
    acl_doc = _repo_root() / "ACL_REHAB.md"
    try:
        return acl_doc.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        raise ACLKnowledgeError("ACL_REHAB.md not found in repository root.") from exc
    except OSError as exc:
        raise ACLKnowledgeError(f"Failed to read ACL_REHAB.md: {exc}") from exc


def retrieve_acl_snippets(query: str, max_snippets: int = 3) -> list[KnowledgeSnippet]:
    """
    Retrieve small ACL rehab snippets by keyword overlap.

    This is a deterministic, hackathon-friendly retrieval layer ("RAG-lite"):
    - Split source doc by sections.
    - Score sections by shared keyword count with user query.
    - Return top relevant sections.

    Raises:
        ACLKnowledgeError: If no meaningful snippet matches the query.
    """
    text = load_acl_rehab_text()
    sections = [s.strip() for s in text.split("\n\n") if s.strip()]
    query_terms = {t.lower() for t in query.replace(",", " ").split() if len(t) >= 3}

    scored: list[tuple[int, str]] = []
    for sec in sections:
        sec_l = sec.lower()
        score = sum(1 for term in query_terms if term in sec_l)
        if score > 0:
            scored.append((score, sec))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:max_snippets]
    if not top:
        raise ACLKnowledgeError("No matching ACL rehab context found for this query.")

    snippets: list[KnowledgeSnippet] = []
    for idx, (_, body) in enumerate(top, start=1):
        snippets.append(KnowledgeSnippet(title=f"acl_context_{idx}", body=body))
    return snippets

