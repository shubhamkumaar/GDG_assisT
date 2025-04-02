from fastapi import APIRouter, Depends, HTTPException, status, Body,Form, UploadFile, File
from pydantic import BaseModel
import server.db.models as models
from typing import Optional
from sqlalchemy.orm import Session
from server.db.database import get_db
from typing import Annotated
from server.routers.auth import verify_jwt_token
from server.utils.google_cloud_storage import upload_file
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
    
    if user.is_teacher:
        class_teacher = db.query(models.Classes).filter(models.Classes.id == class_id.strip()).first()
        if class_teacher.teacher_id != user.id:
            raise HTTPException(status_code=403, detail="Forbidden")
    else:
       class_student = db.query(models.Class_Students).filter(models.Class_Students.student_id == user.id).filter(models.Class_Students.class_id == class_id.strip()).first()  
       if class_student is None:
           raise HTTPException(status_code=403, detail="Forbidden")  
    
    assignments = db.query(models.Assignments).filter(models.Assignments.class_id == class_id.strip()).all()
    return [{"assignment_id": a.id, "assignment_name": a.assignment_name,"description":a.assignment_description,"deadline":a.assignment_deadline} for a in assignments]

# Get students in a class
@router.get("/students",status_code=status.HTTP_200_OK)
async def get_students(class_id:str,user:user_dependency,db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    
    if user.is_teacher:
        class_teacher = db.query(models.Classes).filter(models.Classes.id == class_id.strip()).first()
        if class_teacher.teacher_id != user.id:
            raise HTTPException(status_code=403, detail="Forbidden")
    else :
        class_student = db.query(models.Class_Students).filter(models.Class_Students.student_id == user.id).filter(models.Class_Students.class_id == class_id.strip()).first()  
        if class_student is None:
            raise HTTPException(status_code=403, detail="Forbidden")  
    
    students = db.query(models.User).join(models.Class_Students, models.User.id == models.Class_Students.student_id).filter(models.Class_Students.class_id == class_id.strip()).all()
    return [{"id": s.id, "name": s.name,"email":s.email,"phone":s.phone} for s in students]

# Get materials of a class
@router.get("/materials",status_code=status.HTTP_201_CREATED)
async def get_materials(class_id:str,user:user_dependency,db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    
    if user.is_teacher:
        class_teacher = db.query(models.Classes).filter(models.Classes.id == class_id.strip()).first()
        if class_teacher.teacher_id != user.id:
            raise HTTPException(status_code=403, detail="Forbidden")
    else:
        class_student = db.query(models.Class_Students).filter(models.Class_Students.student_id == user.id).filter(models.Class_Students.class_id == class_id.strip()).first()  
        if class_student is None:
            raise HTTPException(status_code=403, detail="Forbidden")  
    
    materials = db.query(models.Materials).filter(models.Materials.class_id == class_id.strip()).all()
    return materials

# Get Announcements of a class
@router.get("/announcements",status_code=status.HTTP_201_CREATED)
async def get_announcements(class_id:str,user:user_dependency,db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    
    if user.is_teacher:
        class_teacher = db.query(models.Classes).filter(models.Classes.id == class_id.strip()).first()
        if class_teacher.teacher_id != user.id:
            raise HTTPException(status_code=403, detail="Forbidden")
    else:
        class_student = db.query(models.Class_Students).filter(models.Class_Students.student_id == user.id).filter(models.Class_Students.class_id == class_id.strip()).first()  
        if class_student is None:
            raise HTTPException(status_code=403, detail="Forbidden")  
    
    announcements = db.query(models.Announcements,models.User).filter(models.Announcements.class_id == class_id.strip()).join(models.User, models.User.id == models.Announcements.user_id).all()
    return [dict(announcement=a[0],created_by=dict(name=a[1].name,email=a[1].email,pic=a[1].profile_pic),) for a in announcements]

# Post materials of a class
@router.post("/materials",status_code=status.HTTP_201_CREATED)
async def post_materials(
    user:user_dependency,
    db: db_dependency,
    class_id: str = Form(...),
    material_name: str = Form(...),
    material_description: str = Form(...),
    material_link: Optional[UploadFile] = File(None)
):
    
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    
    if not user.is_teacher:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    if user.is_teacher:
        class_teacher = db.query(models.Classes).filter(models.Classes.id == class_id.strip()).first()
        if class_teacher.teacher_id != user.id:
            raise HTTPException(status_code=403, detail="Forbidden")
    
    new_material = models.Materials(
        class_id=class_id.strip(),
        material_name=material_name,
        description=material_description,
    )
    # return new_material
    if material_link:
        res = await upload_file(material_link)
        print()
        new_material.material_file = res['file_url']
    db.add(new_material)
    db.commit()
    db.refresh(new_material)
    return {"class_id": class_id, "material_id":new_material.id,"material_name": material_name, "material_description": material_description, "material_link": new_material.material_file}
    # return {"message":"Material posted successfully"}

# Post Announcements of a class
@router.post("/announcements",status_code=status.HTTP_201_CREATED)
async def post_announcements(
    user:user_dependency,
    db: db_dependency,
    class_id: str = Form(...),
    subject: str = Form(...),
    message: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    
    # if not user.is_teacher:
    #     raise HTTPException(status_code=403, detail="Forbidden")
    
    if user.is_teacher:
        class_teacher = db.query(models.Classes).filter(models.Classes.id == class_id.strip()).first()
        if class_teacher.teacher_id != user.id:
            raise HTTPException(status_code=403, detail="Forbidden")
    
    class_student = db.query(models.Class_Students).filter(models.Class_Students.student_id == user.id).filter(models.Class_Students.class_id == class_id.strip()).first()  
    if class_student is None:
        raise HTTPException(status_code=403, detail="Forbidden")  
    new_announcement = models.Announcements(
        class_id=class_id.strip(),
        subject=subject,
        message=message,
        user_id=user.id
    )
    if file:
        res = await upload_file(file)
        print()
        new_announcement.file = res['file_url']
    db.add(new_announcement)
    db.commit()
    db.refresh(new_announcement)
    return {"class_id": class_id, "announcement_id":new_announcement.id,"announcement": subject, "message": message, "file":new_announcement.file,"created_at":new_announcement.announcement_time}
