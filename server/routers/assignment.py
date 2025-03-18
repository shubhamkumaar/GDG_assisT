from fastapi import APIRouter, UploadFile
from server.utils.google_cloud_storage import upload_file
import os
router = APIRouter(
    prefix="/assignment",
    tags=["assignment"]
)
@router.post("/uploadfile/")
async def create_upload_file(file: UploadFile):
    if not file:
        return {"message": "file not found"}
    
    file_path = f"./server/public/{file.filename}"
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    res = upload_file(file_path)    
    os.remove(file_path)
    return {"file_url": res}    