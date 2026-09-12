"""
main.py — Entry point alias for running with `uvicorn main:app`.
Imports the FastAPI application instance from app.py.
"""
from app import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
