from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health_check():
    """Health check endpoint to verify that the API is running."""
    return {"status": "ok"}