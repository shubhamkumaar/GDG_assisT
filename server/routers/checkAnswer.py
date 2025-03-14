import os
import io
from functools import lru_cache
from server import config
from typing import Annotated
from mistralai import Mistral
from fastapi import APIRouter,File, UploadFile

router = APIRouter()

@lru_cache
def get_settings():
    return config.Settings()

Settings = get_settings()

    
api_key =Settings.MISTRAL_API_KEY
client = Mistral(api_key=api_key)

async def ocrResponse():
    # Upload file to Mistral
    uploaded_pdf = client.files.upload(
        file={
            "file_name": "uploaded_file.pdf",
            "content": open("./public/uploaded_file.pdf","rb"),
        },
        purpose="ocr"
    )     

    # Get file_id that uploaded to Mistral
    client.files.retrieve(file_id=uploaded_pdf.id)

    signed_url = client.files.get_signed_url(file_id=uploaded_pdf.id)

    # Get the OCR response from Mistral
    ocr_response = client.ocr.process(
        model="mistral-ocr-latest",
        document={
            "type": "document_url",
            "document_url": signed_url.url,
        }
    )    
    return ocr_response

baseDir = "./public"
@router.post("/check")
async def checkAnswer(file: UploadFile | None = None):
    # Upload file to my server
    if not file:
        return {"message": "No upload file sent"}
    
    os.makedirs(baseDir, exist_ok=True)  # Ensure the directory exists

    # Always keep the file in the public folder named as uploaded_file
    file_path = os.path.join(baseDir, "uploaded_file.pdf")
    
    #Save the file in the file_path 
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())  # Async read the content and write to file
    
    # Calling OCR 
    response = await ocrResponse()    

    # Remove the file after OCR response
    os.remove(file_path)

    # Return the OCR response
    return {"OCR":response}

