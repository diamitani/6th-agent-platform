"""
Settings Management Routes
Platform configuration and user preferences
"""

from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import json
from typing import Any

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/")
async def get_settings(current_user: dict = Depends()):
    """Get all user settings"""
    return {
        "user_id": current_user["id"],
        "profile": {
            "email": current_user["email"],
            "name": current_user.get("name", ""),
            "avatar_url": None,
            "bio": "ROSTR Agent Platform User",
            "timezone": "America/Chicago",
            "language": "en-US",
            "email_notifications": True,
            "push_notifications": True,
            "theme": "dark",
            "accent_color": "#c9a227"  # Artispreneur gold
        },
        "security": {
            "two_factor_enabled": False,
            "session_timeout_minutes": 60,
            "login_notifications": True,
            "api_key_rotation_days": 30,
            "last_password_change": None,
            "login_history": []
        },
        "notifications": {
            "email": {
                "agent_updates": True,
                "task_completions": True,
                "billing": True,
                "system_alerts": True,
                "marketing": False
            },
            "push": {
                "urgent_tasks": True,
                "agent_errors": True,
                "system_maintenance": True
            },
            "in_app": {
                "all": True,
                "frequency": "real_time"
            }
        },
        "developer": {
            "api_rate_limit": 1000,
            "webhook_urls": [],
            "debug_mode": False,
            "log_level": "info",
            "export_format": "json"
        },
        "billing": {
            "payment_method": None,
            "invoice_emails": True,
            "auto_renew": True,
            "currency": "USD"
        },
        "workspace_defaults": {
            "default_agent_type": "researcher",
            "auto_archive_completed_tasks": True,
            "data_retention_days": 90,
            "allow_external_integrations": True
        },
        "integrations": {
            "aws_bedrock": True,
            "stripe": False,
            "slack": False,
            "github": False
        }
    }


@router.put("/profile")
async def update_profile_settings(
    name: str | None = None,
    bio: str | None = None,
    timezone: str | None = None,
    language: str | None = None,
    theme: str | None = None,
    current_user: dict = Depends()
):
    """Update profile settings"""
    updates = {}
    if name is not None:
        updates["name"] = name
    if bio is not None:
        updates["bio"] = bio
    if timezone is not None:
        updates["timezone"] = timezone
    if language is not None:
        updates["language"] = language
    if theme is not None:
        if theme not in ["light", "dark", "auto"]:
            raise HTTPException(status_code=400, detail="Theme must be light, dark, or auto")
        updates["theme"] = theme
    
    return {
        "message": "Profile settings updated",
        "updates": updates,
        "updated_at": datetime.utcnow().isoformat()
    }


@router.put("/notifications")
async def update_notification_settings(
    email_agent_updates: bool | None = None,
    email_task_completions: bool | None = None,
    email_billing: bool | None = None,
    push_urgent_tasks: bool | None = None,
    push_agent_errors: bool | None = None,
    current_user: dict = Depends()
):
    """Update notification settings"""
    updates = {}
    if email_agent_updates is not None:
        updates["email_agent_updates"] = email_agent_updates
    if email_task_completions is not None:
        updates["email_task_completions"] = email_task_completions
    if email_billing is not None:
        updates["email_billing"] = email_billing
    if push_urgent_tasks is not None:
        updates["push_urgent_tasks"] = push_urgent_tasks
    if push_agent_errors is not None:
        updates["push_agent_errors"] = push_agent_errors
    
    return {
        "message": "Notification settings updated",
        "updates": updates,
        "updated_at": datetime.utcnow().isoformat()
    }


@router.put("/developer")
async def update_developer_settings(
    api_rate_limit: int | None = None,
    webhook_urls: list[str] | None = None,
    debug_mode: bool | None = None,
    log_level: str | None = None,
    current_user: dict = Depends()
):
    """Update developer settings"""
    updates = {}
    if api_rate_limit is not None:
        if api_rate_limit < 100:
            raise HTTPException(status_code=400, detail="API rate limit must be at least 100")
        updates["api_rate_limit"] = api_rate_limit
    if webhook_urls is not None:
        updates["webhook_urls"] = webhook_urls
    if debug_mode is not None:
        updates["debug_mode"] = debug_mode
    if log_level is not None:
        if log_level not in ["debug", "info", "warning", "error"]:
            raise HTTPException(status_code=400, detail="Log level must be debug, info, warning, or error")
        updates["log_level"] = log_level
    
    return {
        "message": "Developer settings updated",
        "updates": updates,
        "updated_at": datetime.utcnow().isoformat()
    }


@router.put("/security")
async def update_security_settings(
    session_timeout_minutes: int | None = None,
    login_notifications: bool | None = None,
    api_key_rotation_days: int | None = None,
    current_user: dict = Depends()
):
    """Update security settings"""
    updates = {}
    if session_timeout_minutes is not None:
        if session_timeout_minutes < 15 or session_timeout_minutes > 480:
            raise HTTPException(status_code=400, detail="Session timeout must be between 15 and 480 minutes")
        updates["session_timeout_minutes"] = session_timeout_minutes
    if login_notifications is not None:
        updates["login_notifications"] = login_notifications
    if api_key_rotation_days is not None:
        if api_key_rotation_days < 7:
            raise HTTPException(status_code=400, detail="API key rotation must be at least 7 days")
        updates["api_key_rotation_days"] = api_key_rotation_days
    
    return {
        "message": "Security settings updated",
        "updates": updates,
        "updated_at": datetime.utcnow().isoformat()
    }


@router.post("/security/two-factor")
async def enable_two_factor_auth(
    enabled: bool = True,
    current_user: dict = Depends()
):
    """Enable or disable two-factor authentication"""
    return {
        "message": f"Two-factor authentication {'enabled' if enabled else 'disabled'}",
        "enabled": enabled,
        "recovery_codes": ["code1", "code2", "code3", "code4"] if enabled else None,
        "updated_at": datetime.utcnow().isoformat()
    }


@router.get("/api-keys")
async def get_api_keys(current_user: dict = Depends()):
    """Get user API keys"""
    # In production, fetch from secure storage
    api_keys = [
        {
            "key_id": "api-key-001",
            "name": "Primary Platform Key",
            "created_at": datetime.utcnow().isoformat(),
            "last_used": datetime.utcnow().isoformat(),
            "permissions": ["read:agents", "write:tasks", "read:analytics"],
            "status": "active"
        }
    ]
    
    return {
        "api_keys": api_keys,
        "total": len(api_keys),
        "rotates_in_days": 15
    }


@router.post("/api-keys/create")
async def create_api_key(
    name: str,
    permissions: list[str],
    current_user: dict = Depends()
):
    """Create new API key"""
    available_permissions = [
        "read:agents", "write:agents",
        "read:tasks", "write:tasks",
        "read:analytics", "write:analytics",
        "read:billing", "write:billing",
        "read:workspace", "write:workspace"
    ]
    
    invalid_permissions = [p for p in permissions if p not in available_permissions]
    if invalid_permissions:
        raise HTTPException(status_code=400, detail=f"Invalid permissions: {invalid_permissions}")
    
    api_key_value = f"6thagent_{datetime.utcnow().strftime('%Y%m%d')}_{current_user['id'][-8:]}"
    
    return {
        "message": "API key created",
        "key": api_key_value,
        "name": name,
        "permissions": permissions,
        "created_at": datetime.utcnow().isoformat(),
        "expires_at": (datetime.utcnow() + timedelta(days=365)).isoformat(),
        "caution": "Store this key securely. It will not be shown again."
    }


@router.delete("/api-keys/{key_id}")
async def revoke_api_key(key_id: str, current_user: dict = Depends()):
    """Revoke API key"""
    return {
        "message": f"API key {key_id} revoked",
        "key_id": key_id,
        "revoked_at": datetime.utcnow().isoformat(),
        "affected_applications": []
    }


@router.get("/export")
async def export_user_data(
    data_types: list[str] | None = None,
    format: str = "json",
    current_user: dict = Depends()
):
    """Export user data"""
    if data_types is None:
        data_types = ["profile", "agents", "tasks", "analytics"]
    
    available_types = ["profile", "agents", "tasks", "analytics", "billing", "settings"]
    invalid_types = [t for t in data_types if t not in available_types]
    
    if invalid_types:
        return {
            "message": f"Invalid data types: {invalid_types}",
            "available_types": available_types,
            "format_supported": format
        }
    
    export_id = f"export-{datetime.utcnow().strftime('%Y%m%d')}-{current_user['id'][-8:]}"
    
    return {
        "export_id": export_id,
        "data_types": data_types,
        "format": format,
        "estimated_size": "125KB",
        "download_url": f"https://exports.6thagent.com/{export_id}.{format}",
        "expires_at": (datetime.utcnow() + timedelta(days=7)).isoformat(),
        "status": "processing"
    }


@router.delete("/account", dependencies=[Depends(admin_only)])
async def delete_account_permanently(current_user: dict = Depends()):
    """Delete user account permanently"""
    return {
        "message": "Account deletion requested",
        "user_id": current_user["id"],
        "scheduled_deletion": (datetime.utcnow() + timedelta(days=30)).isoformat(),
        "data_backup_available": True,
        "confirmation_email_sent": True
    }


@router.get("/system/defaults")
async def get_system_defaults():
    """Get system default settings"""
    return {
        "plan_defaults": {
            "free-forever": {
                "max_agents": 5,
                "max_api_calls": 1000,
                "max_storage_mb": 1024,
                "max_workspace_members": 3
            },
            "pro": {
                "max_agents": float("inf"),
                "max_api_calls": 10000,
                "max_storage_mb": 10240,
                "max_workspace_members": 10
            },
            "enterprise": {
                "max_agents": float("inf"),
                "max_api_calls": float("inf"),
                "max_storage_mb": float("inf"),
                "max_workspace_members": float("inf")
            }
        },
        "rate_limits": {
            "api_requests": {
                "per_minute": 60,
                "per_hour": 1000,
                "per_day": 10000
            },
            "agent_creation": {
                "per_day": 10,
                "per_hour": 5
            },
            "task_execution": {
                "concurrent": 10,
                "per_agent": 5
            }
        },
        "data_retention": {
            "task_logs": "90 days",
            "agent_memory": "30 days",
            "user_sessions": "7 days",
            "analytics": "12 months"
        }
    }


# Admin utility for free test account
import threading

def admin_only(current_user: dict = Depends()):
    """Check if user has admin permissions"""
    if "admin:access" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Admin permissions required")
    return current_user


@router.get("/admin/free-test-status", dependencies=[Depends(admin_only)])
async def get_free_test_account_status():
    """Get free test account status"""
    return {
        "special_account": {
            "email": "patrick.diamitani@gmail.com",
            "plan": "free-forever",
            "created_at": datetime.utcnow().isoformat(),
            "last_access": datetime.utcnow().isoformat(),
            "status": "active",
            "usage": {
                "agents": 2,
                "tasks": 1247,
                "api_calls": 3489,
                "storage_mb": 125
            },
            "notes": "Free forever account for platform development and testing"
        }
    }


# Update imports to include timedelta
from datetime import timedelta