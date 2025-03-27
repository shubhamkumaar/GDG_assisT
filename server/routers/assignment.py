from fastapi import APIRouter, UploadFile, HTTPException, Depends, File,Form, status
from datetime import datetime, timezone
import server.db.models as models
from sqlalchemy.orm import Session
from server.db.database import get_db
from typing import Annotated
from server.routers.auth import verify_jwt_token
from server.utils.google_cloud_storage import upload_file
from typing import Optional

router = APIRouter(
    prefix="/assignment",
    tags=["assignment"]
)

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[models.User, Depends(verify_jwt_token)]

# Get assignment details
@router.get("/",status_code=status.HTTP_200_OK)
async def get_assignment(assignment_id:str,user:user_dependency,db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    assignment = db.query(models.Assignments).filter(models.Assignments.id == assignment_id.strip()).first()
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    if user.is_teacher:
        teacher_class = db.query(models.Classes).filter(models.Classes.id == assignment.class_id).first()
        if teacher_class.teacher_id != user.id:
            raise HTTPException(status_code=403, detail="Forbidden")
    
    student_class = (
        db.query(models.Class_Students)
        .filter(models.Class_Students.student_id == user.id)
        .filter(models.Class_Students.class_id == assignment.class_id)
        .first()
        )
    
    if student_class is None:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    if user.is_teacher:
        return {
            "assignment_id": assignment.id,
            "assignment_name": assignment.assignment_name,
            "assignment_description": assignment.assignment_description,
            "deadline": assignment.assignment_deadline,
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
@router.post("/create_assignment",status_code=status.HTTP_201_CREATED)
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
    
    # check to see if the class is owned by the teacher
    selected_class = db.query(models.Classes).filter(models.Classes.id == class_id).first()
    if selected_class is None:
        raise HTTPException(status_code=404, detail="Class not found")
    else:
        if selected_class.teacher_id != user.id:
            raise HTTPException(status_code=403, detail="Forbidden")

    assignment = models.Assignments(
        class_id=class_id,
        assignment_name=name,
        assignment_description=description
    )
    if deadline:
        # check to see if the deadline is valid, and is in the future
        if deadline < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Invalid deadline")
        assignment.deadline = deadline
    if file:
        res = await upload_file(file)
        assignment.assignment_file = res["file_url"]

    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    
    return {"assignment_id": assignment.id, "assignment_name": assignment.assignment_name}

# Submit assignment
@router.post("/submit_assignment",status_code=status.HTTP_201_CREATED)
async def submit_assignment(assignment_id:int,file:UploadFile,user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    
    if user.is_teacher:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    assignment = db.query(models.Assignments).filter(models.Assignments.id == assignment_id).first()
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    student_class = (
        db.query(models.Class_Students)
        .filter(models.Class_Students.student_id == user.id)
        .filter(models.Class_Students.class_id == assignment.class_id)
        .first()
        )
    
    if student_class is None:
        raise HTTPException(status_code=403, detail="Forbidden")
    
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
@router.post("/answer_key",status_code=status.HTTP_201_CREATED)
async def upload_answer_key(assignment_id:int,file:UploadFile,user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    
    if not user.is_teacher:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    assignment = db.query(models.Assignments).filter(models.Assignments.id == assignment_id).first()
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    teacher_class = db.query(models.Classes).filter(models.Classes.id == assignment.class_id).first()
    if teacher_class.teacher_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    res = await upload_file(file)
    assignment.answer_key = res["file_url"]
    db.commit()
    return {"message": "Answer key uploaded successfully", "file_url": assignment.answer_key}

# Get all submissions for an assignment by teacher
@router.get("/submissions",status_code=status.HTTP_200_OK)
async def get_submissions(assignment_id:int,user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    
    if not user.is_teacher:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    
    assignment = db.query(models.Assignments).filter(models.Assignments.id == assignment_id).first()
    if assignment is None:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    teacher_class = db.query(models.Classes).filter(models.Classes.id == assignment.class_id).first()
    if teacher_class.teacher_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    submissions = (
        db.query(models.Submissions,models.User)
        .filter(models.Submissions.assignment_id == assignment_id) 
        .join(models.User,models.User.id == models.Submissions.student_id)
        .all())
    return [
        {
            "submission_id": submission[0].id,
            "student_name": submission[1].name,
            "student_email": submission[1].email,
            "submission_file": submission[0].submission_file
        }
        for submission in submissions
    ]
