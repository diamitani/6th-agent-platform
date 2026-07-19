"""
S3-backed knowledge base store for the ROSTR Reference Hub.

Implements the paper's multi-namespace hierarchy on top of AWS S3
(or any S3-compatible endpoint such as MinIO for local dev):

    s3://{bucket}/
        projects/{project-id}/knowledge-base/...
        orgs/{org-id}/knowledge-base/...
        teams/{team-id}/shared-context/...
        global/knowledge-base/...

Environment:
    ROSTR_KB_BUCKET     bucket name (required for live mode)
    AWS_REGION          region (default us-east-1)
    S3_ENDPOINT_URL     optional override for MinIO/localstack
    AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY  standard AWS credentials
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Any, Optional

from loguru import logger

VALID_NAMESPACES = ("projects", "orgs", "teams", "global")


class S3KnowledgeStore:
    def __init__(
        self,
        bucket: Optional[str] = None,
        region: Optional[str] = None,
        endpoint_url: Optional[str] = None,
    ):
        self.bucket = bucket or os.getenv("ROSTR_KB_BUCKET", "")
        self.region = region or os.getenv("AWS_REGION", "us-east-1")
        self.endpoint_url = endpoint_url or os.getenv("S3_ENDPOINT_URL") or None
        self._client = None

    @property
    def enabled(self) -> bool:
        return bool(self.bucket)

    def _s3(self):
        if self._client is None:
            import boto3  # deferred so the API boots without AWS deps configured

            self._client = boto3.client(
                "s3", region_name=self.region, endpoint_url=self.endpoint_url
            )
        return self._client

    @staticmethod
    def _key(namespace: str, scope_id: str, filename: str) -> str:
        if namespace not in VALID_NAMESPACES:
            raise ValueError(f"namespace must be one of {VALID_NAMESPACES}")
        safe_name = filename.lstrip("/")
        if namespace == "global":
            return f"global/knowledge-base/{safe_name}"
        folder = "shared-context" if namespace == "teams" else "knowledge-base"
        return f"{namespace}/{scope_id}/{folder}/{safe_name}"

    # ----------------------------------------------------------------- Write

    def put_document(
        self,
        namespace: str,
        scope_id: str,
        filename: str,
        content: bytes,
        content_type: str = "application/octet-stream",
        metadata: Optional[dict[str, str]] = None,
    ) -> dict[str, Any]:
        key = self._key(namespace, scope_id, filename)
        meta = {
            "uploaded-at": datetime.now(timezone.utc).isoformat(),
            **(metadata or {}),
        }
        self._s3().put_object(
            Bucket=self.bucket,
            Key=key,
            Body=content,
            ContentType=content_type,
            Metadata=meta,
        )
        logger.info(f"KB stored s3://{self.bucket}/{key} ({len(content)} bytes)")
        return {"bucket": self.bucket, "key": key, "size": len(content), "metadata": meta}

    def put_entry(self, namespace: str, scope_id: str, entry: dict) -> dict[str, Any]:
        """Store a structured RAG DAL knowledge entry as JSON."""
        entry_id = entry.get("id") or datetime.now(timezone.utc).strftime(
            "%Y%m%dT%H%M%S%f"
        )
        return self.put_document(
            namespace,
            scope_id,
            f"entries/{entry_id}.json",
            json.dumps(entry, ensure_ascii=False).encode("utf-8"),
            content_type="application/json",
        )

    # ------------------------------------------------------------------ Read

    def list_documents(
        self, namespace: str, scope_id: str, prefix: str = "", max_keys: int = 200
    ) -> list[dict[str, Any]]:
        key_prefix = self._key(namespace, scope_id, prefix) if prefix else self._key(
            namespace, scope_id, ""
        )
        resp = self._s3().list_objects_v2(
            Bucket=self.bucket, Prefix=key_prefix, MaxKeys=max_keys
        )
        return [
            {
                "key": obj["Key"],
                "filename": obj["Key"].split("/")[-1],
                "size": obj["Size"],
                "last_modified": obj["LastModified"].isoformat(),
            }
            for obj in resp.get("Contents", [])
        ]

    def get_document(self, key: str) -> bytes:
        resp = self._s3().get_object(Bucket=self.bucket, Key=key)
        return resp["Body"].read()

    def presigned_url(self, key: str, expires_seconds: int = 3600) -> str:
        return self._s3().generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=expires_seconds,
        )

    def presigned_upload_url(
        self, namespace: str, scope_id: str, filename: str, expires_seconds: int = 3600
    ) -> dict[str, str]:
        key = self._key(namespace, scope_id, filename)
        url = self._s3().generate_presigned_url(
            "put_object",
            Params={"Bucket": self.bucket, "Key": key},
            ExpiresIn=expires_seconds,
        )
        return {"key": key, "upload_url": url}

    # ---------------------------------------------------------------- Delete

    def delete_document(self, key: str) -> bool:
        self._s3().delete_object(Bucket=self.bucket, Key=key)
        return True
