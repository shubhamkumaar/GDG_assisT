from fastapi import FastAPI,Depends,Request
from typing import Annotated
from .routers import check_answer, feedback, auth, assignment, home, classes, profile, generate_quiz
from starlette.middleware.sessions import SessionMiddleware
import json
from fastapi.middleware.cors import CORSMiddleware
import redis
# from fastapi_sessions.backends.redis import RedisBackends
# from server.db.database import get_db
# import server.db.models as models
# # from sqlalchemy.orm import Session
# from .routers.auth import verify_jwt_token


app = FastAPI()

# print(MIDDLEWARE_SECRET_KEY)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    # allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# app.add_middleware(
#    SessionMiddleware, 
#    secret_key="WELL_FUCK_EVERYTHING_THE_ERROR_IS_FROM_HERE_CAUSE_THIS_FUCKER_CANT_STORE_SESSIONS",
#    session_cookie="your_session_cookie",
#    same_site="lax",
#    max_age=86400,
#    https_only=False,
# #    auto_error=True
#    )

app.add_middleware(SessionMiddleware,secret_key="fucksrh",session_cookie="your_session_cookie",same_site="none")

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
   # file_path = pathlib.Path("server/public/quiz.pdf")
   # url = "https://storage.googleapis.com/gdg-assist/07812d4d_22BCE11326MIDTERMCSE2004.pdf"
   # file_path.write_bytes(httpx.get(url).content)
   # return {"Hello": "World"}
    with open('server/public/quiz.json', 'r') as file:
       data = json.load(file)
    return data


# Mainly for debugging
@app.get("/test-session")
async def test_session(request: Request):
    session = request.session.get("test_key")
    if session:
        return {"message": f"Session exists: {session}"}
    request.session["test_key"] = "session_works"
    return {"message": "New session set!"}