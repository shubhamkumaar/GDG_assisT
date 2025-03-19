from fastapi import APIRouter, Depends, HTTPException, status
import server.db.models as models
from server.db.database import get_db
from sqlalchemy.orm import Session
from typing import Annotated
from server.routers.auth import verify_jwt_token

router = APIRouter(
    prefix="/teacher",
    tags=["teacher"],
)

# DB Connection
db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[models.User, Depends(verify_jwt_token)] 

@router.post("/create_class",status_code=status.HTTP_201_CREATED)
async def create_class(user:user_dependency,class_name: str, class_description: str, db: db_dependency) :
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    if not user.is_teacher:
        raise HTTPException(status_code=403, detail="Forbidden")
    db_teacher = db.query(models.Teachers).filter(models.Teachers.user_id == user.id).first()
    if db_teacher is None:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    new_class = models.Classes(
        class_name=class_name, 
        class_description=class_description,
        teacher_id=db_teacher.id
    )
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return {"class_id": new_class.id, "class_name": new_class.class_name, "class_description": new_class.class_description}

