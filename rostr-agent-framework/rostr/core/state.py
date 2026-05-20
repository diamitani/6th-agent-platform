"""State management across sessions and namespaces"""

from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from pathlib import Path
from datetime import datetime
import json


@dataclass
class StateEntry:
    """A state entry"""
    key: str
    value: Any
    namespace: str
    timestamp: datetime
    metadata: Dict[str, Any]


class StateManager:
    """Manages state at four levels: session, project, org, agent"""

    def __init__(self, storage_path: Path):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)

    def set(
        self,
        key: str,
        value: Any,
        namespace: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Set a state value"""

        namespace_path = self._get_namespace_path(namespace)
        namespace_path.mkdir(parents=True, exist_ok=True)

        state_file = namespace_path / f"{key}.json"

        entry = {
            "key": key,
            "value": value,
            "namespace": namespace,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }

        with open(state_file, 'w') as f:
            json.dump(entry, f, indent=2)

    def get(self, key: str, namespace: str) -> Optional[Any]:
        """Get a state value"""

        namespace_path = self._get_namespace_path(namespace)
        state_file = namespace_path / f"{key}.json"

        if not state_file.exists():
            return None

        with open(state_file) as f:
            entry = json.load(f)
            return entry.get("value")

    def delete(self, key: str, namespace: str):
        """Delete a state value"""

        namespace_path = self._get_namespace_path(namespace)
        state_file = namespace_path / f"{key}.json"

        if state_file.exists():
            state_file.unlink()

    def list_keys(self, namespace: str) -> List[str]:
        """List all keys in a namespace"""

        namespace_path = self._get_namespace_path(namespace)

        if not namespace_path.exists():
            return []

        return [f.stem for f in namespace_path.glob("*.json")]

    def append_to_log(
        self,
        log_name: str,
        entry: Dict[str, Any],
        namespace: str
    ):
        """Append to a JSONL log file"""

        namespace_path = self._get_namespace_path(namespace)
        namespace_path.mkdir(parents=True, exist_ok=True)

        log_file = namespace_path / f"{log_name}.jsonl"

        with open(log_file, 'a') as f:
            f.write(json.dumps({
                **entry,
                "timestamp": datetime.now().isoformat()
            }) + '\n')

    def read_log(
        self,
        log_name: str,
        namespace: str,
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Read entries from a JSONL log"""

        namespace_path = self._get_namespace_path(namespace)
        log_file = namespace_path / f"{log_name}.jsonl"

        if not log_file.exists():
            return []

        entries = []
        with open(log_file) as f:
            for line in f:
                entries.append(json.loads(line))

        if limit:
            entries = entries[-limit:]

        return entries

    def _get_namespace_path(self, namespace: str) -> Path:
        """Get path for a namespace"""
        # Convert namespace like "project/my-proj" to "project_my-proj"
        clean_namespace = namespace.replace("/", "_")
        return self.storage_path / clean_namespace
