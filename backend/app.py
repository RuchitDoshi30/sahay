from fastapi import FastAPI
from routes.calculate import router as calculate_router
from routes.partners import router as partners_router
from routes.recommend import router as recommend_router
from routes.result import router as result_router

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Sahay - SIH26092")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sahaysetu.vercel.app",
        "https://sahaysetup.pages.dev",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(recommend_router)
app.include_router(calculate_router)
app.include_router(partners_router)
app.include_router(result_router)


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}