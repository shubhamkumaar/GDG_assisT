from fastapi import APIRouter, UploadFile, HTTPException, Depends, File,Form
from datetime import datetime, timezone
import server.db.models as models
from sqlalchemy.orm import Session
from server.db.database import get_db
from typing import Annotated
from server.routers.auth import verify_jwt_token
from server.utils.google_cloud_storage import upload_file
from typing import Optional
from pydantic import BaseModel

router = APIRouter(
    prefix="/assignment",
    tags=["assignment"]
)

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[models.User, Depends(verify_jwt_token)]

# Get assignment details
@router.get("/",status_code=200)
async def get_assignment(assignment_id:str,user:user_dependency,db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    assignment = db.query(models.Assignments).filter(models.Assignments.id == assignment_id.strip()).first()
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    if user.is_teacher:
        return {
            "assignment_id": assignment.id,
            "assignment_name": assignment.assignment_name,
            "assignment_description": assignment.assignment_description,
            "deadline": assignment.deadline,
            "file": assignment.assignment_file,
            "answer_file": assignment.answer_key
        }
    return {
        "assignment_id": assignment.id,
        "assignment_name": assignment.assignment_name,
        "assignment_description": assignment.assignment_description,
        "deadline": assignment.deadline,
        "file": assignment.assignment_file
    }

# Create assignment for a class
@router.post("/create_assignment")
async def create_assignment(
    user: user_dependency,
    db: db_dependency,
    class_id: str = Form(...),
    name: str = Form(...),
    description: str = Form(...),
    deadline: Optional[datetime] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    if not user.is_teacher:
        raise HTTPException(status_code=403, detail="Forbidden")
    print(deadline)
    
    assignment = models.Assignments(
        class_id=class_id,
        assignment_name=name,
        assignment_description=description
    )
    if deadline:
        assignment.deadline = deadline
    if file:
        res = await upload_file(file)
        assignment.assignment_file = res["file_url"]

    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    
    return {"assignment_id": assignment.id, "assignment_name": assignment.assignment_name}

# Submit assignment
@router.post("/submit_assignment")
async def submit_assignment(assignment_id:int,file:UploadFile,user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    
    if user.is_teacher:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    assignment = db.query(models.Assignments).filter(models.Assignments.id == assignment_id).first()
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    res = await upload_file(file)
    try:
        submission = models.Submissions(
            assignment_id=assignment_id,
            student_id=user.id,
            submission_file=res["file_url"]
        )
        db.add(submission)
        db.commit()
        db.refresh(submission)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"submission_id": submission.id, "file_url": submission.submission_file}

# Upload answer key for assignment by teacher
@router.post("/answer_key")
async def upload_answer_key(assignment_id:int,file:UploadFile,user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    
    if not user.is_teacher:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    assignment = db.query(models.Assignments).filter(models.Assignments.id == assignment_id).first()
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    res = await upload_file(file)
    assignment.answer_key = res["file_url"]
    db.commit()
    return {"message": "Answer key uploaded successfully", "file_url": assignment.answer_key}
