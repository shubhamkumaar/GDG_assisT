from fastapi import FastAPI,Depends,HTTPException,status
from typing import Annotated
from fastapi.responses import JSONResponse
from .routers import check_answer, feedback, auth, assignment, home, classes
from server.db.database import get_db
import server.db.models as models
from sqlalchemy.orm import Session
from .routers.auth import verify_jwt_token
from starlette.middleware.sessions import SessionMiddleware

app = FastAPI()

app.add_middleware(SessionMiddleware, secret_key="your_secret_key_here")

app.include_router(feedback.router)
app.include_router(check_answer.router)
app.include_router(auth.router)
app.include_router(home.router)
app.include_router(assignment.router)
app.include_router(classes.router)

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[models.User, Depends(verify_jwt_token)]    

@app.get("/",status_code=status.HTTP_200_OK)
async def user(user:user_dependency,db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    content = {"user": user.name, "email": user.email, "phone": user.phone, "is_teacher": user.is_teacher}
    response = JSONResponse(content=content)    
    response.set_cookie(key="user_id", value=str(user.id))
    response.set_cookie(key="user_name", value=user.name)
    response.set_cookie(key="user_email", value=user.email)
    response.set_cookie(key="user_phone", value=user.phone)
    response.set_cookie(key="is_teacher", value=user.is_teacher)
    return response
    