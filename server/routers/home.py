from fastapi import APIRouter, Depends, HTTPException, status
import server.db.models as models
from sqlalchemy.orm import Session
from server.db.database import get_db
from typing import Annotated
from server.routers.auth import verify_jwt_token

router = APIRouter(
    tags=["Home"],
)

# DB Connection
db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[models.User, Depends(verify_jwt_token)]

# Get the all the register classes of the user
@router.get("/classes",status_code=status.HTTP_200_OK)
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

# Teacher can create a class
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

# Join the class
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
 
# When any teacher signup using google oauth, is_teacher field is set to False
# So, we need to update the is_teacher field to True
@router.get("/update_isteacher",status_code=status.HTTP_201_CREATED)
async def update_isteacher(user:user_dependency, db: db_dependency) :
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
        
    user = db.query(models.User).filter(models.User.id == user.id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_teacher = True
    db.commit()
    return {"message": "User updated successfully"}  
  
#  Get the assignments which are not submitted by the student
@router.get("/todo",status_code=status.HTTP_200_OK)
async def get_todo(user:user_dependency, db: db_dependency) :
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    
    if user.is_teacher:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    todos = (
        db.query(models.Class_Students,models.Assignments,models.Submissions,models.Classes)
        # join the class_students table with assignments table on class_id
        .join(models.Assignments,models.Class_Students.class_id == models.Assignments.class_id)
        # left join the submissions table with the above table on student_id and assignment_id
        .outerjoin(models.Submissions,(models.Submissions.student_id == user.id) & (models.Submissions.assignment_id == models.Assignments.id))
        # filter the student id who queried
        .filter(models.Class_Students.student_id == user.id)
        # Join the classes table with the class_students table on class_id to get the class name
        .join(models.Classes,models.Class_Students.class_id == models.Classes.id)
        # filter the assignments which are not submitted
        .filter(models.Submissions.id == None)
        .all()
    )

    todos_list = []

    # todos_list = [{"t0": t[0], "t1": t[1],"t2":t[2],"t3":t[3]} for t in todos]
    # return todos_list

    for t in todos:
        # classes = db.query(models.Classes).filter(models.Classes.id == t[0].class_id).first()
        todos_list.append({
            "assignment_id": t[1].id,
            "assignment_name": t[1].assignment_name,
            "assignment_description": t[1].assignment_description,
            "class_id": t[0].class_id,
            "class_name": t[3].class_name,
            "due_date": t[1].assignment_deadline
        })
    return todos_list
