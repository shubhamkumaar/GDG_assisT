from fastapi import FastAPI,Depends,HTTPException,status
from typing import Annotated
from fastapi.responses import JSONResponse
from .routers import feedback, checkAnswer, auth
from server.db.database import SessionLocal, engine
import server.db.models as models
from sqlalchemy.orm import Session
from .routers.auth import get_current_user
app = FastAPI()


app.include_router(feedback.router)
app.include_router(checkAnswer.router)
app.include_router(auth.router)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
db_dependency = Annotated[Session, Depends(get_db)]

user_dependency = Annotated[models.User, Depends(get_current_user)]    

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
    