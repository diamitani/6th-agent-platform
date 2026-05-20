"""Knowledge base for storing and retrieving research"""

from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
import json
import uuid


@dataclass
class KnowledgeEntry:
    """A single knowledge base entry"""
    entry_id: str
    query_origin: str
    content: str
    summary: str
    source_url: str
    source_title: str
    source_author: Optional[str]
    published_date: Optional[datetime]
    retrieved_date: datetime
    tier: int
    credibility_score: float
    topics: List[str]
    confidence: float
    verification_status: str  # verified | uncertain | open

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for storage"""
        data = asdict(self)
        # Convert datetime to ISO format
        data['published_date'] = self.published_date.isoformat() if self.published_date else None
        data['retrieved_date'] = self.retrieved_date.isoformat()
        return data

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'KnowledgeEntry':
        """Create from dictionary"""
        # Convert ISO strings back to datetime
        if data.get('published_date'):
            data['published_date'] = datetime.fromisoformat(data['published_date'])
        data['retrieved_date'] = datetime.fromisoformat(data['retrieved_date'])
        return cls(**data)


class KnowledgeBase:
    """
    Storage and retrieval for accumulated knowledge

    In production, this would use:
    - Supabase with pgvector
    - Pinecone
    - Weaviate
    - Or similar vector database

    For MVP, we use JSON files
    """

    def __init__(self, storage_path: Path):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)

    def store(self, entry: KnowledgeEntry, namespace: str = "global") -> str:
        """
        Store a knowledge entry

        Args:
            entry: KnowledgeEntry to store
            namespace: Namespace for organization (project/{id}, org/{id}, etc.)

        Returns:
            entry_id
        """
        namespace_path = self.storage_path / namespace.replace("/", "_")
        namespace_path.mkdir(parents=True, exist_ok=True)

        entry_file = namespace_path / f"{entry.entry_id}.json"

        with open(entry_file, 'w') as f:
            json.dump(entry.to_dict(), f, indent=2)

        # Also append to the namespace index
        index_file = namespace_path / "index.jsonl"
        with open(index_file, 'a') as f:
            f.write(json.dumps({
                "entry_id": entry.entry_id,
                "query_origin": entry.query_origin,
                "topics": entry.topics,
                "confidence": entry.confidence,
                "tier": entry.tier,
                "retrieved_date": entry.retrieved_date.isoformat()
            }) + '\n')

        return entry.entry_id

    def retrieve(self, entry_id: str, namespace: str = "global") -> Optional[KnowledgeEntry]:
        """Retrieve a specific entry by ID"""
        namespace_path = self.storage_path / namespace.replace("/", "_")
        entry_file = namespace_path / f"{entry_id}.json"

        if not entry_file.exists():
            return None

        with open(entry_file) as f:
            data = json.load(f)
            return KnowledgeEntry.from_dict(data)

    def search(
        self,
        query: str,
        namespace: str = "global",
        limit: int = 10
    ) -> List[KnowledgeEntry]:
        """
        Search for relevant entries

        In production, this would use vector similarity search.
        For MVP, we do simple keyword matching.
        """
        namespace_path = self.storage_path / namespace.replace("/", "_")
        index_file = namespace_path / "index.jsonl"

        if not index_file.exists():
            return []

        # Simple keyword matching (would be vector search in production)
        query_lower = query.lower()
        matches = []

        with open(index_file) as f:
            for line in f:
                index_entry = json.loads(line)
                if query_lower in index_entry['query_origin'].lower():
                    # Load full entry
                    entry = self.retrieve(index_entry['entry_id'], namespace)
                    if entry:
                        matches.append(entry)

                if len(matches) >= limit:
                    break

        return matches

    def list_namespaces(self) -> List[str]:
        """List all available namespaces"""
        return [
            p.name.replace("_", "/")
            for p in self.storage_path.iterdir()
            if p.is_dir()
        ]
