from fastapi import APIRouter, Depends, HTTPException, status
import server.db.models as models
from server.db.database import get_db
from sqlalchemy.orm import Session
from typing import Annotated
from server.routers.auth import verify_jwt_token

router = APIRouter(
    prefix="/classes",
    tags=["classes"],
)
# DB Connection
db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[models.User, Depends(verify_jwt_token)]

@router.get("/",status_code=status.HTTP_200_OK)
async def get_classes(user:user_dependency,db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    
    classes = []
    if user.is_teacher:
        db_teacher = db.query(models.Teachers).filter(models.Teachers.user_id == user.id).first()
        if db_teacher is None:
            raise HTTPException(status_code=404, detail="Teacher not found")
        classes = db.query(models.Classes).filter(models.Classes.teacher_id == db_teacher.id).all()
    else:
        db_student = db.query(models.Students).filter(models.Students.user_id == user.id).first()
        if db_student is None:
            raise HTTPException(status_code=404, detail="Student not found")
        classes = db.query(models.Classes).filter(models.Classes.id == db_student.class_id).all()
    return [{"class_id": c.id, "class_name": c.class_name, "class_description": c.class_description} for c in classes]
