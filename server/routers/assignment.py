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

@router.post("/submit_assignment/")
async def submit_assignment():
    return {"message": "submit assignment"}

@router.post("/uploadfile/")
async def create_upload_file(file: UploadFile):
    if not file:
        return {"message": "file not found"}
    res = await upload_file(file)
    return res