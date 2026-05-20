"""Intent extraction from raw human input"""

from typing import Dict, List, Any
from dataclasses import dataclass
from enum import Enum
import anthropic
import os


class Domain(str, Enum):
    """Task domain classification"""
    CODE = "code"
    DESIGN = "design"
    RESEARCH = "research"
    OPS = "ops"
    SALES = "sales"
    CONTENT = "content"
    DEPLOY = "deploy"
    DEBUG = "debug"


class Urgency(str, Enum):
    """Task urgency level"""
    IMMEDIATE = "immediate"
    QUEUED = "queued"
    SCHEDULED = "scheduled"


@dataclass
class Intent:
    """Extracted intent from user input"""
    primary_intent: str
    domain: Domain
    subject: str
    constraints: List[str]
    desired_output: str
    urgency: Urgency
    ambiguity_score: float
    raw_input: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "primary_intent": self.primary_intent,
            "domain": self.domain.value,
            "subject": self.subject,
            "constraints": self.constraints,
            "desired_output": self.desired_output,
            "urgency": self.urgency.value,
            "ambiguity_score": self.ambiguity_score,
            "raw_input": self.raw_input,
        }


class IntentExtractor:
    """Extracts structured intent from natural language input"""

    def __init__(self, model: str = "claude-haiku-4-5"):
        self.model = model
        self.client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    def extract(self, raw_input: str) -> Intent:
        """Extract intent from raw user input"""

        # Build the extraction prompt
        system_prompt = """You are an intent extraction system for an AI agent framework.

Your job is to analyze user input and extract structured intent information.

Return a JSON object with these fields:
- primary_intent: What the user actually wants to achieve (one clear sentence)
- domain: One of: code, design, research, ops, sales, content, deploy, debug
- subject: The thing being acted upon (file, feature, system, etc.)
- constraints: List of explicit limits or requirements
- desired_output: What "done" looks like (file, summary, action, decision)
- urgency: One of: immediate, queued, scheduled
- ambiguity_score: 0.0 (crystal clear) to 1.0 (very vague)

Examples:

Input: "fix the login bug"
Output: {
  "primary_intent": "Debug and fix the authentication issue in the login flow",
  "domain": "debug",
  "subject": "login authentication",
  "constraints": ["must fix root cause, not just symptoms"],
  "desired_output": "working login with regression test",
  "urgency": "immediate",
  "ambiguity_score": 0.3
}

Input: "research competitor pricing"
Output: {
  "primary_intent": "Research and analyze competitor pricing strategies",
  "domain": "research",
  "subject": "competitor pricing models",
  "constraints": [],
  "desired_output": "structured report with pricing comparison table",
  "urgency": "queued",
  "ambiguity_score": 0.2
}

Be precise and actionable. Extract maximum clarity from minimal input."""

        # Call Claude to extract intent
        response = self.client.messages.create(
            model=self.model,
            max_tokens=1024,
            system=system_prompt,
            messages=[{
                "role": "user",
                "content": f"Extract intent from this input:\n\n{raw_input}"
            }]
        )

        # Parse the response
        import json
        intent_data = json.loads(response.content[0].text)

        return Intent(
            primary_intent=intent_data["primary_intent"],
            domain=Domain(intent_data["domain"]),
            subject=intent_data["subject"],
            constraints=intent_data.get("constraints", []),
            desired_output=intent_data["desired_output"],
            urgency=Urgency(intent_data["urgency"]),
            ambiguity_score=intent_data["ambiguity_score"],
            raw_input=raw_input
        )
