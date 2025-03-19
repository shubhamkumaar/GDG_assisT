import os
import uuid
from google.cloud import storage
from server import config
from functools import lru_cache
from fastapi import HTTPException

@lru_cache
def get_settings():
    return config.Settings()
Settings = get_settings()

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = Settings.GOOGLE_APPLICATION_CREDENTIALS

# Uploads a file to the bucket
async def upload_file(file):
    if not file:
        return {"message": "file not found", "status": 404}
    # Save the file to the server
    source_file_path = f"./server/public/{file.filename}"
    with open(source_file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Initialize a storage client
    storage_client = storage.Client()
    bucket = storage_client.bucket("gdg-assist")

    file_name = os.path.basename(source_file_path)
    # Create unique filename
    destination_filename = f"{uuid.uuid4().hex[:8]}_{file_name}"

    # Optional: set a generation-match precondition to avoid race conditions
    generation_match_precondition = 0
    try:
        blob = bucket.blob(destination_filename)
        blob.upload_from_filename(source_file_path,if_generation_match=generation_match_precondition)
        blob.make_public()
        file_url = blob.public_url
        return {"file_url":file_url,"message": "file uploaded successfully", "status": 200}
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while uploading the file.")
        
    finally:
        # Delete the file from the server
        os.remove(source_file_path)
# print(upload_file("./server/public/SOFTWARE22BCE10461.pdf"))

# delete file from the bucket
def delete_file(file_url):

    # Name of the file to delete
    blob_name = file_url.split("/")[-1]

    # Initialize a storage client
    try:
        storage_client = storage.Client()
    
        bucket = storage_client.bucket("gdg-assist")
        
        blob = bucket.blob(blob_name)
        
        if not blob.exists():
            raise HTTPException(status_code=404, detail=f"File {blob_name} does not exist")
        
        # Optional: set a generation-match precondition to avoid potential race conditions
        # and data corruptions. The request to delete is aborted if the object's
        # generation number does not match your precondition.
        blob.reload()  # Fetch blob metadata to use in generation_match_precondition.
        generation_match_precondition = blob.generation
    
        blob.delete(if_generation_match=generation_match_precondition)

        return {"message": f"File {blob_name} deleted successfully", "status": 200} 
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while deleting the file.")
    
# print(delete_file("https://storage.googleapis.com/gdg-assist/4ce84e6c_SOFTWARE22BCE10461.pdf"))