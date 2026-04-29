"""
Verifies Supabase JWT tokens sent from the React frontend.
Every protected endpoint calls get_current_user() as a dependency.
"""

import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Service-role client — can verify any user's token
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

bearer = HTTPBearer()


async def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer)) -> dict:
    """
    FastAPI dependency — extracts and verifies the Supabase JWT.
    Use as:  user = Depends(get_current_user)
    """
    token = creds.credentials
    try:
        response = supabase.auth.get_user(token)
        if response.user is None:
            raise ValueError("No user in token")
        return {"id": response.user.id, "email": response.user.email}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token. Please log in again."
        )