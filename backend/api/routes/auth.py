"""
Authentication Routes
Modern, clean authentication for SaaS platform
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

# User database (in production, use SQL/NoSQL)
users_db = {
    "patrick.diamitani@gmail.com": {
        "user_id": "user-free-001",
        "email": "patrick.diamitani@gmail.com",
        "name": "Pat Diamitani",
        "hashed_password": "free-forever",  # Simplified for demo
        "plan": "free-forever",
        "workspace_id": "free-workspace-001",
        "permissions": ["agent:create", "workspace:read", "billing:read", "chat:access", "search:use"],
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow()
    }
}


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login endpoint with JWT generation"""
    email = form_data.username
    
    if email not in users_db:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = users_db[email]
    
    # Update login timestamp
    user["last_login"] = datetime.utcnow()
    
    # In production, use proper password verification
    if form_data.password != user["hashed_password"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate token (in production, use JWT)
    access_token = f"token-{uuid.uuid4()}"
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "plan": user["plan"],
            "workspace_id": user["workspace_id"],
            "permissions": user["permissions"]
        }
    }


@router.post("/register")
async def register(email: str, name: str, password: str):
    """Register new user"""
    if email in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_id = f"user-{uuid.uuid4()}"
    workspace_id = f"workspace-{uuid.uuid4()}"
    
    users_db[email] = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "hashed_password": password,  # Should be hashed in production
        "plan": "free-trial",
        "workspace_id": workspace_id,
        "permissions": ["agent:create", "workspace:read", "billing:read"],
        "created_at": datetime.utcnow(),
        "last_login": datetime.utcnow()
    }
    
    return {
        "message": "Registration successful",
        "user_id": user_id,
        "workspace_id": workspace_id,
        "plan": "free-trial",
        "trial_expires": (datetime.utcnow() + timedelta(days=14)).isoformat()
    }


@router.get("/verify")
async def verify_token(token: str):
    """Verify authentication token"""
    # Simplified token verification
    if token.startswith("token-"):
        return {
            "valid": True,
            "message": "Token is valid"
        }
    
    raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/logout")
async def logout():
    """Logout endpoint"""
    return {
        "message": "Logged out successfully"
    }


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """Refresh authentication token"""
    # In production, validate refresh token
    return {
        "access_token": f"token-{uuid.uuid4()}",
        "token_type": "bearer"
    }


@router.post("/reset-password")
async def reset_password(email: str):
    """Request password reset"""
    if email not in users_db:
        return {
            "message": "If an account exists, password reset instructions have been sent"
        }
    
    return {
        "message": "Password reset instructions sent to email",
        "reset_token": f"reset-{uuid.uuid4()}"
    }