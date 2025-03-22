from fastapi import FastAPI,Depends
from typing import Annotated
from .routers import check_answer, feedback, auth, assignment, home, classes, profile, generate_quiz
from starlette.middleware.sessions import SessionMiddleware
import json
# from server.db.database import get_db
# import server.db.models as models
# # from sqlalchemy.orm import Session
# from .routers.auth import verify_jwt_token

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key="your_secret_key_here")

app.include_router(feedback.router)
app.include_router(check_answer.router)
app.include_router(auth.router)
app.include_router(home.router)
app.include_router(assignment.router)
app.include_router(classes.router)
app.include_router(profile.router)
app.include_router(generate_quiz.router)
# db_dependency = Annotated[Session, Depends(get_db)]
# user_dependency = Annotated[models.User, Depends(verify_jwt_token)]    

@app.get("/")
def read_root():
    with open('server/public/quiz.json', 'r') as file:
       data = json.load(file)
    return data