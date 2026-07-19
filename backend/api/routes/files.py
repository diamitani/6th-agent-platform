"""Files API — S3-backed Reference Hub knowledge base storage."""

from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import Response

router = APIRouter()


def _store(request: Request):
    store = getattr(request.app.state, "knowledge_store", None)
    if store is None:
        raise HTTPException(503, "Knowledge store not initialized")
    if not store.enabled:
        raise HTTPException(
            503, "S3 knowledge base not configured — set ROSTR_KB_BUCKET"
        )
    return store


@router.get("/status")
async def storage_status(request: Request):
    store = getattr(request.app.state, "knowledge_store", None)
    return {
        "provider": "s3",
        "live": bool(store and store.enabled),
        "bucket": store.bucket if store and store.enabled else None,
        "region": store.region if store else None,
    }


@router.post("/upload")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    namespace: str = Form("projects"),
    scope_id: str = Form("default"),
):
    store = _store(request)
    try:
        content = await file.read()
        return store.put_document(
            namespace=namespace,
            scope_id=scope_id,
            filename=file.filename or "unnamed",
            content=content,
            content_type=file.content_type or "application/octet-stream",
        )
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(502, f"Upload failed: {e}")


@router.get("/list")
async def list_documents(
    request: Request,
    namespace: str = "projects",
    scope_id: str = "default",
    prefix: str = "",
):
    store = _store(request)
    try:
        return {"items": store.list_documents(namespace, scope_id, prefix)}
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(502, f"List failed: {e}")


@router.get("/download")
async def download_document(request: Request, key: str):
    store = _store(request)
    try:
        content = store.get_document(key)
        return Response(content=content, media_type="application/octet-stream")
    except Exception as e:
        raise HTTPException(404, f"Document not found: {e}")


@router.get("/presign")
async def presign_url(request: Request, key: str, expires: int = 3600):
    store = _store(request)
    return {"url": store.presigned_url(key, expires)}


@router.post("/presign-upload")
async def presign_upload(
    request: Request,
    namespace: str = Form("projects"),
    scope_id: str = Form("default"),
    filename: str = Form(...),
):
    store = _store(request)
    try:
        return store.presigned_upload_url(namespace, scope_id, filename)
    except ValueError as e:
        raise HTTPException(400, str(e))


@router.delete("/")
async def delete_document(request: Request, key: str):
    store = _store(request)
    try:
        store.delete_document(key)
        return {"deleted": True, "key": key}
    except Exception as e:
        raise HTTPException(502, f"Delete failed: {e}")
