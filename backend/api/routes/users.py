"""
User Management Routes
Modern user profile and settings management
"""

from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import uuid

router = APIRouter(prefix="/users", tags=["Users"])

# Dependency for admin routes
async def require_admin(current_user: dict = Depends()):
    """Check if user has admin permissions"""
    if "admin:access" not in current_user.get("permissions", []):
        raise HTTPException(status_code=403, detail="Admin permissions required")
    return current_user


@router.get("/me")
async def get_current_user(current_user: dict = Depends()):
    """Get current user profile"""
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user.get("name", ""),
        "plan": current_user.get("plan", "free-forever"),
        "workspace_id": current_user.get("workspace_id"),
        "permissions": current_user.get("permissions", []),
        "profile": {
            "avatar_url": None,
            "bio": "ROSTR Agent Platform User",
            "timezone": "America/Chicago",
            "language": "en-US",
            "notifications_enabled": True,
            "email_notifications": True,
        }
    }


@router.put("/me")
async def update_profile(
    name: str | None = None,
    bio: str | None = None,
    timezone: str | None = None,
    language: str | None = None,
    current_user: dict = Depends()
):
    """Update user profile"""
    updates = {}
    if name is not None:
        updates["name"] = name
    if bio is not None:
        updates["bio"] = bio
    if timezone is not None:
        updates["timezone"] = timezone
    if language is not None:
        updates["language"] = language
    
    return {
        "message": "Profile updated successfully",
        "updates": updates,
        "user_id": current_user["id"]
    }


@router.get("/usage")
async def get_usage_stats(current_user: dict = Depends()):
    """Get current user's platform usage stats"""
    user_id = current_user["id"]
    
    return {
        "user_id": user_id,
        "period": "current_month",
        "agents": {
            "total_created": 5,
            "active": 2,
            "inactive": 3
        },
        "tasks": {
            "total_completed": 1247,
            "pending": 3,
            "failed": 8
        },
        "api_calls": {
            "total": 3489,
            "last_24h": 142
        },
        "storage": {
            "used_mb": 125,
            "limit_mb": 1024
        },
        "subscription": {
            "plan": current_user.get("plan", "free-forever"),
            "next_billing": None,
            "status": "active"
        }
    }


@router.get("/subscription")
async def get_subscription(current_user: dict = Depends()):
    """Get user subscription details"""
    plan = current_user.get("plan", "free-forever")
    
    plans = {
        "free-forever": {
            "name": "Free Forever",
            "features": [
                "Up to 5 agents",
                "Basic analytics",
                "Email support",
                "1000 API calls/month",
                "1GB storage",
                "Community access"
            ],
            "price": "$0/month",
            "upgrade_available": True
        },
        "pro": {
            "name": "Pro",
            "features": [
                "Unlimited agents",
                "Advanced analytics",
                "Priority support",
                "10000 API calls/month",
                "10GB storage",
                "Team collaboration",
                "Custom integrations"
            ],
            "price": "$49/month",
            "upgrade_available": True
        },
        "enterprise": {
            "name": "Enterprise",
            "features": [
                "Unlimited agents",
                "Enterprise analytics",
                "24/7 support",
                "Unlimited API calls",
                "Unlimited storage",
                "Multi-team workspaces",
                "SLA guarantee",
                "Custom development"
            ],
            "price": "Contact sales",
            "upgrade_available": True
        }
    }
    
    current_plan = plans.get(plan, plans["free-forever"])
    
    return {
        "current_plan": current_plan,
        "available_plans": plans,
        "billing_email": current_user["email"],
        "trial_info": {
            "has_trial": plan == "free-trial",
            "trial_ends": None,
            "remaining_days": None
        },
        "payment_method": None,
        "invoices": []
    }


@router.post("/subscription/upgrade")
async def upgrade_subscription(plan_name: str, current_user: dict = Depends()):
    """Upgrade subscription plan"""
    available_plans = ["pro", "enterprise"]
    
    if plan_name not in available_plans:
        raise HTTPException(status_code=400, detail=f"Invalid plan. Available: {available_plans}")
    
    return {
        "message": f"Subscription upgrade to {plan_name} initiated",
        "plan": plan_name,
        "next_step": "complete_payment",
        "subscription_id": f"sub-{uuid.uuid4()}"
    }


@router.get("/workspaces")
async def get_user_workspaces(current_user: dict = Depends()):
    """Get all workspaces user belongs to"""
    user_id = current_user["id"]
    
    # In production, fetch from database
    workspaces = [
        {
            "workspace_id": current_user.get("workspace_id", "default-workspace"),
            "name": "Personal Workspace",
            "role": "admin",
            "members": 1,
            "agents_count": 2,
            "created_at": datetime.utcnow().isoformat()
        }
    ]
    
    return {
        "user_id": user_id,
        "workspaces": workspaces,
        "total": len(workspaces)
    }


# Admin-only routes
@router.get("/admin/all", dependencies=[Depends(require_admin)])
async def get_all_users():
    """Get all users (admin only)"""
    # In production, fetch from database with pagination
    users = [
        {
            "id": "user-free-001",
            "email": "patrick.diamitani@gmail.com",
            "name": "Pat Diamitani",
            "plan": "free-forever",
            "workspace_id": "free-workspace-001",
            "created_at": datetime.utcnow().isoformat(),
            "last_active": datetime.utcnow().isoformat()
        }
    ]
    
    return {
        "users": users,
        "total": len(users),
        "active": len(users),
        "inactive": 0
    }


@router.get("/admin/stats", dependencies=[Depends(require_admin)])
async def get_user_statistics():
    """Get platform user statistics (admin only)"""
    return {
        "total_users": 1,
        "active_today": 1,
        "plans_distribution": {
            "free-forever": 1,
            "pro": 0,
            "enterprise": 0
        },
        "avg_session_duration": "45m",
        "monthly_growth": "+0%"
    }