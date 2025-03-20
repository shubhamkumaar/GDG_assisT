from fastapi import APIRouter, Depends, HTTPException, status
import server.db.models as models
from sqlalchemy.orm import Session
from server.db.database import get_db
from typing import Annotated
from server.routers.auth import verify_jwt_token

router = APIRouter(
    prefix="/class",
    tags=["class"],
)
# DB Connection
db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[models.User, Depends(verify_jwt_token)]

@router.get("/",status_code=status.HTTP_200_OK)
async def get_classes(user:user_dependency,db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    
    
    if user.is_teacher:
        classes = db.query(models.Classes).filter(models.Classes.teacher_id == user.id).all()
        return [{"class_id": c.id, "class_name": c.class_name} for c in classes]
    else:
        class_student = db.query(models.Class_Students).filter(models.Class_Students.student_id == user.id).all()
        classes = []
        for cs in class_student:
            c = db.query(models.Classes).filter(models.Classes.id == cs.class_id).first()
            teacher = db.query(models.User).filter(models.User.id == c.teacher_id).first()
            classes.append({
                "class_id": c.id,
                "class_name": c.class_name,
                "teacher_name": teacher.name,
                "teacher_email": teacher.email,
                "teacher_phone": teacher.phone
                })
        return classes


@router.post("/create_class",status_code=status.HTTP_201_CREATED)
async def create_class(class_name: str, user:user_dependency, db: db_dependency) :
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    if not user.is_teacher:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    new_class = models.Classes(
        class_name=class_name,
        teacher_id=user.id
    )

    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return {"class_id": new_class.id, "class_name": new_class.class_name}

@router.post("/join_class",status_code=status.HTTP_201_CREATED)
async def join_class(class_id: str, user:user_dependency, db: db_dependency) :
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    if user.is_teacher:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    class_student = models.Class_Students(
        class_id=class_id,
        student_id=user.id
    )
    db.add(class_student)
    db.commit()
    return {"message": "Joined class successfully"}

# @router.get("/{class_id}",status_code=status.HTTP_200_OK)
# async def get_class(class_id: str, user:user_dependency, db: db_dependency):
#     if user is None:
#         raise HTTPException(status_code=404, detail="Authentication required")
    