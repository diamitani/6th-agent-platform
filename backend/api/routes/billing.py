"""
Billing and Subscription Routes
Usage tracking and subscription management
"""

from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timedelta
import uuid

router = APIRouter(prefix="/billing", tags=["Billing"])


@router.get("/subscription")
async def get_subscription_status(current_user: dict = Depends()):
    """Get current subscription status"""
    plan = current_user.get("plan", "free-forever")
    user_id = current_user["id"]
    
    # Plans configuration
    plans = {
        "free-forever": {
            "name": "Free Forever",
            "price": "$0/month",
            "status": "active",
            "next_billing": None,
            "features": [
                "Up to 5 agents",
                "Basic analytics",
                "Email support",
                "1000 API calls/month",
                "1GB storage",
                "Community access"
            ],
            "limits": {
                "max_agents": 5,
                "max_api_calls": 1000,
                "max_storage_mb": 1024,
                "max_workspace_members": 3
            }
        },
        "pro": {
            "name": "Pro",
            "price": "$49/month",
            "status": "not-subscribed",
            "next_billing": None,
            "features": [
                "Unlimited agents",
                "Advanced analytics",
                "Priority support",
                "10000 API calls/month",
                "10GB storage",
                "Team collaboration",
                "Custom integrations"
            ],
            "limits": {
                "max_agents": float("inf"),
                "max_api_calls": 10000,
                "max_storage_mb": 10240,
                "max_workspace_members": 10
            }
        },
        "enterprise": {
            "name": "Enterprise",
            "price": "Contact sales",
            "status": "not-subscribed",
            "next_billing": None,
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
            "limits": {
                "max_agents": float("inf"),
                "max_api_calls": float("inf"),
                "max_storage_mb": float("inf"),
                "max_workspace_members": float("inf")
            }
        }
    }
    
    current_plan = plans.get(plan, plans["free-forever"])
    current_plan["status"] = "active"  # Active for current plan
    
    # Usage stats (in production, fetch from database)
    usage = {
        "agents": {"used": 2, "limit": current_plan["limits"]["max_agents"]},
        "api_calls": {"used": 3489, "limit": current_plan["limits"]["max_api_calls"]},
        "storage_mb": {"used": 125, "limit": current_plan["limits"]["max_storage_mb"]},
        "workspace_members": {"used": 1, "limit": current_plan["limits"]["max_workspace_members"]}
    }
    
    return {
        "user_id": user_id,
        "current_plan": current_plan,
        "available_plans": plans,
        "usage": usage,
        "next_billing_cycle": (datetime.utcnow() + timedelta(days=30)).isoformat(),
        "payment_method": None,
        "billing_email": current_user["email"]
    }


@router.post("/subscription/upgrade")
async def upgrade_subscription(
    plan_name: str,
    payment_token: str | None = None,
    current_user: dict = Depends()
):
    """Upgrade subscription plan"""
    available_plans = ["pro", "enterprise"]
    
    if plan_name not in available_plans:
        raise HTTPException(status_code=400, detail=f"Invalid plan. Available: {available_plans}")
    
    # Process payment (simplified)
    if payment_token:
        # In production, process payment with Stripe/Chargebee
        payment_success = True
    else:
        payment_success = plan_name in ["free-forever"]  # Free plans don't need payment
    
    if not payment_success:
        raise HTTPException(status_code=402, detail="Payment required")
    
    subscription_id = f"sub-{uuid.uuid4()}"
    
    return {
        "message": f"Subscription upgraded to {plan_name}",
        "subscription_id": subscription_id,
        "plan": plan_name,
        "activation_date": datetime.utcnow().isoformat(),
        "next_billing": (datetime.utcnow() + timedelta(days=30)).isoformat(),
        "invoice_url": f"https://billing.6thagent.com/invoices/{subscription_id}"
    }


@router.post("/subscription/downgrade")
async def downgrade_subscription(current_user: dict = Depends()):
    """Downgrade to free plan"""
    return {
        "message": "Subscription downgraded to Free Forever",
        "plan": "free-forever",
        "downgraded_at": datetime.utcnow().isoformat(),
        "next_billing": None,
        "refund_amount": "$0.00",
        "notice": "Downgrade completed successfully. You retain access through the end of your current billing period."
    }


@router.post("/subscription/cancel")
async def cancel_subscription(current_user: dict = Depends()):
    """Cancel subscription"""
    plan = current_user.get("plan", "free-forever")
    
    if plan == "free-forever":
        raise HTTPException(status_code=400, detail="Free plan does not require cancellation")
    
    return {
        "message": "Subscription cancellation requested",
        "plan": "free-forever",  # Move to free plan
        "cancellation_date": datetime.utcnow().isoformat(),
        "access_until": (datetime.utcnow() + timedelta(days=30)).isoformat(),  # Access through billing period
        "confirmation_email_sent": True
    }


@router.get("/usage/detailed")
async def get_detailed_usage(
    period: str = "last_30_days",
    current_user: dict = Depends()
):
    """Get detailed usage breakdown"""
    user_id = current_user["id"]
    
    # Monthly usage breakdown
    usage_breakdown = {
        "aws_bedrock": {
            "cost": 12.47,
            "breakdown": {
                "deepseek_v3_model_calls": {"count": 1247, "cost": 8.72},
                "claude_model_calls": {"count": 400, "cost": 3.75}
            }
        },
        "storage": {
            "cost": 0.42,
            "breakdown": {
                "agent_memory": {"size_mb": 45, "cost": 0.15},
                "file_storage": {"size_mb": 80, "cost": 0.27}
            }
        },
        "api_calls": {
            "cost": 0.00,
            "breakdown": {
                "agent_api": {"call_count": 3489, "cost": 0.00},
                "external_api": {"call_count": 142, "cost": 0.00}
            }
        },
        "total": {
            "cost": 12.89,
            "currency": "USD"
        }
    }
    
    return {
        "user_id": user_id,
        "period": period,
        "breakdown": usage_breakdown,
        "summary": {
            "total_cost": "$12.89",
            "cost_compared_previous": "-$2.11",
            "most_expensive_resource": "AWS Bedrock",
            "cost_per_agent": "$6.45"
        }
    }


@router.get("/invoices")
async def get_invoices(current_user: dict = Depends()):
    """Get billing invoices"""
    # In production, fetch from payment provider
    invoices = [
        {
            "invoice_id": "inv-001",
            "date": (datetime.utcnow() - timedelta(days=30)).isoformat(),
            "amount": "$0.00",
            "description": "Free Forever Plan",
            "status": "paid",
            "download_url": None
        }
    ]
    
    return {
        "invoices": invoices,
        "total": len(invoices),
        "total_paid": "$0.00",
        "outstanding_balance": "$0.00"
    }


@router.get("/payment-methods")
async def get_payment_methods(current_user: dict = Depends()):
    """Get saved payment methods"""
    # In production, fetch from payment provider
    payment_methods = []
    
    return {
        "payment_methods": payment_methods,
        "default_method": None,
        "requires_payment_method": False
    }


@router.post("/payment-methods/add")
async def add_payment_method(
    payment_method_type: str,
    token: str,
    current_user: dict = Depends()
):
    """Add new payment method"""
    # In production, save to Stripe/Cardinity
    payment_method_id = f"pm-{uuid.uuid4()}"
    
    return {
        "message": "Payment method added successfully",
        "payment_method_id": payment_method_id,
        "type": payment_method_type,
        "last4": token[-4:] if len(token) > 4 else "XXXX",
        "saved_at": datetime.utcnow().isoformat()
    }


@router.delete("/payment-methods/{payment_method_id}")
async def remove_payment_method(
    payment_method_id: str,
    current_user: dict = Depends()
):
    """Remove payment method"""
    return {
        "message": f"Payment method {payment_method_id} removed",
        "payment_method_id": payment_method_id,
        "removed_at": datetime.utcnow().isoformat()
    }


@router.get("/aws-billing")
async def get_aws_billing_integration(current_user: dict = Depends()):
    """Get AWS billing integration status"""
    return {
        "aws_account_linked": True,
        "aws_account_id": "123456789012",
        "bedrock_usage_tracked": True,
        "cost_allocation_tags": ["Project:rostr", "Environment:production", "Workspace:default"],
        "month_to_date_cost": "$12.47",
        "forecasted_monthly_cost": "$14.80",
        "recommendations": [
            "Consider reserved instances for savings",
            "Enable S3 lifecycle policies for cost reduction",
            "Use spot instances for experimental agents"
        ]
    }


@router.post("/aws-billing/link")
async def link_aws_account(
    aws_access_key: str,
    aws_secret_key: str,
    aws_region: str = "us-east-1",
    current_user: dict = Depends()
):
    """Link AWS account for usage tracking"""
    # In production, validate AWS credentials
    return {
        "message": "AWS account linked successfully",
        "linked_at": datetime.utcnow().isoformat(),
        "aws_account_id": "123456789012",
        "regions_enabled": [aws_region],
        "cost_categories_linked": ["aws-bedrock", "aws-s3", "aws-ec2"]
    }


# Free test account special handling
@router.get("/free-test-account")
async def get_free_test_account_info():
    """Get free forever test account information"""
    return {
        "special_account": {
            "email": "patrick.diamitani@gmail.com",
            "plan": "free-forever",
            "features": ["unlimited-agents", "basic-analytics", "email-support"],
            "created_at": datetime.utcnow().isoformat(),
            "status": "active"
        },
        "terms": [
            "Account is free forever for testing and development",
            "Includes all basic platform features",
            "Usage tracked for platform improvement",
            "No credit card required"
        ],
        "upgrade_paths": [
            {"plan": "pro", "price": "$49/month"},
            {"plan": "enterprise", "contact": "sales@6thagent.com"}
        ]
    }