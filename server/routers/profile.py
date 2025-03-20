from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
import server.db.models as models
from sqlalchemy.orm import Session
from server.db.database import get_db
from typing import Annotated
from server.routers.auth import verify_jwt_token
from fastapi.responses import JSONResponse
from server.utils.google_cloud_storage import upload_file

router = APIRouter(
    prefix="/profile",
    tags=["profile"],
    responses={404: {"description": "Not found"}},
)
# DB Connection
db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[models.User, Depends(verify_jwt_token)]

@router.get("/",status_code=status.HTTP_200_OK)
async def user(user:user_dependency,db: db_dependency):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    content = {
        "user_id": user.id,
        "user_name": user.name,
        "user_email": user.email,
        "user_phone": user.phone,
        "is_teacher": user.is_teacher,
        "profile_pic": user.profile_pic,
    }

    response = JSONResponse(content=content)    
    response.set_cookie(key="user_id", value=str(user.id))
    response.set_cookie(key="user_name", value=user.name)
    response.set_cookie(key="user_email", value=user.email)
    response.set_cookie(key="user_phone", value=user.phone)
    response.set_cookie(key="is_teacher", value=user.is_teacher)
    return response

@router.post("/update",status_code=status.HTTP_201_CREATED)
async def update_profile(user:user_dependency, db: db_dependency,name: str = None, phone: str = None, profile_pic: UploadFile = File(None)):
    if user is None:
        raise HTTPException(status_code=404, detail="Authentication required")
    if name is not None:
        user.name = name
    if phone is not None:
        user.phone = phone
    if profile_pic is not None:
        res = await upload_file(profile_pic)
        profile_pic = res["file_url"]
        user.profile_pic = profile_pic
    db.commit()
    db.refresh(user)
    return {"user_id": user.id, "user_name": user.name, "user_email": user.email, "user_phone": user.phone, "is_teacher": user.is_teacher, "profile_pic": user.profile_pic}