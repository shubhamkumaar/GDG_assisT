from fastapi import FastAPI
from routers import feedback, checkAnswer
app = FastAPI()

app.include_router(feedback.router)
app.include_router(checkAnswer.router)
@app.get("/")
def read_root():
    return {"Hello": "World"}