"""
Admin authentication and authorization helpers
"""
from fastapi import HTTPException, status, Request
from typing import Optional, Dict, Any
from core.auth import decode_access_token


async def verify_admin_token(token: str) -> Dict[str, Any]:
    """
    Verify admin token and extract admin info
    
    Args:
        token: JWT token from Authorization header
    
    Returns:
        Admin info dict with id, email, role
    
    Raises:
        HTTPException if token is invalid or not an admin
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token"
        )
    
    # Remove "Bearer " prefix if present
    if token.startswith("Bearer "):
        token = token[7:]
    
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Check if token has admin role
    if payload.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    return payload


def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    # Check X-Forwarded-For header first (for proxies)
    if "x-forwarded-for" in request.headers:
        return request.headers["x-forwarded-for"].split(",")[0].strip()
    # Fall back to client connection
    return request.client.host if request.client else "unknown"
