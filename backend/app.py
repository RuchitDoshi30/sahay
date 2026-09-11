from fastapi import FastAPI
from routes.calculate import router as calculate_router
from routes.partners import router as partners_router

app = FastAPI(title="Sahay - SIH26092")
app.include_router(calculate_router)
app.include_router(partners_router)


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}