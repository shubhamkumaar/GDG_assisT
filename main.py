from fastapi import FastAPI
from routers import feedback
app = FastAPI()

app.include_router(feedback.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}