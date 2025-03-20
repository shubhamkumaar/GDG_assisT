from fastapi import APIRouter, Depends, HTTPException, status
import server.db.models as models
from sqlalchemy.orm import Session
from server.db.database import get_db
from typing import Annotated
from server.routers.auth import verify_jwt_token

router = APIRouter(
    prefix="/class",
    tags=["class"],
    responses={404: {"description": "Not found"}},
)
# DB Connection
db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[models.User, Depends(verify_jwt_token)]

# Get class name, teacher name, teacher email, teacher phone etc.
@router.get("/",status_code=status.HTTP_200_OK)
async def get_class_home(class_id:str,user:user_dependency,db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    
    cls = db.query(models.Classes).filter(models.Classes.id == class_id.strip()).first()
    if cls is None:
        raise HTTPException(status_code=404, detail="Class not found")
    teacher = db.query(models.User).filter(models.User.id == cls.teacher_id).first()

    return {
        "class_id": cls.id,
        "class_name": cls.class_name,
        "days_of_week": cls.days_of_week,
        "start_time": cls.start_time,
        "last_instruction_day": cls.last_instruction_day,
        "teacher_name": teacher.name,
        "teacher_email": teacher.email,
        "teacher_phone": teacher.phone,
        }

# Get assignments of a class
@router.get("/assignments",status_code=status.HTTP_200_OK)
async def get_assignments(class_id:str,user:user_dependency,db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    assignments = db.query(models.Assignments).filter(models.Assignments.class_id == class_id.strip()).all()
    return [{"assignment_id": a.id, "assignment_name": a.assignment_name,"description":a.assignment_description,"deadline":a.assignment_deadline} for a in assignments]

# Get students in a class
@router.get("/students",status_code=status.HTTP_200_OK)
async def get_students(class_id:str,user:user_dependency,db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    students = db.query(models.User).join(models.Class_Students, models.User.id == models.Class_Students.student_id).filter(models.Class_Students.class_id == class_id.strip()).all()
    return [{"id": s.id, "name": s.name,"email":s.email,"phone":s.phone} for s in students]

# Get materials of a class
@router.get("/materials",status_code=status.HTTP_201_CREATED)
async def get_materials(class_id:str,user:user_dependency,db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    return {"message":"Not implemented yet"}

# Get Announcements of a class
@router.get("/announcements",status_code=status.HTTP_201_CREATED)
async def get_announcements(class_id:str,user:user_dependency,db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    return {"message":"Not implemented yet"}

