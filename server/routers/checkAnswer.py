import os
import io
import base64
from functools import lru_cache
from typing import Annotated
import uuid
from mistralai import Mistral, OCRResponse
import google.generativeai as genai
from fastapi import APIRouter,File, UploadFile
from server import config
from server.utils.gemini import gemini_generation_config,safety_settings, wait_for_files_active, upload_to_gemini

router = APIRouter()

@lru_cache
def get_settings():
    return config.Settings()

Settings = get_settings()

api_key =Settings.MISTRAL_API_KEY
client = Mistral(api_key=api_key)

gemini_api_key = Settings.GENAI_API_KEY
genai.configure(api_key=gemini_api_key)

async def ocr_response_mistral(file_name:str, file_path:str):
    # Upload file to Mistral
    uploaded_pdf = client.files.upload(
        file={
            "file_name": file_name,
            "content": open(file_path,"rb"),
        },
        purpose="ocr"
    )     

    signed_url = client.files.get_signed_url(file_id=uploaded_pdf.id)

    # Get the OCR response from Mistral
    ocr_response = client.ocr.process(
        model="mistral-ocr-latest",
        document={
            "type": "document_url",
            "document_url": signed_url.url,
        },
        include_image_base64=True
    )    
    return ocr_response

async def ocr_response_gemini(file_path:str)->str:
    gemini_client = genai.GenerativeModel(
                        model_name="gemini-2.0-flash",
                        generation_config=gemini_generation_config,
                        safety_settings=safety_settings
    )
    # upload file to Gemini
    files = [
        upload_to_gemini(file_path)
    ]
    wait_for_files_active(files)

    # start a chat session
    chat_session = gemini_client.start_chat(
        history=[
            {
                    "role": "user",
                    "parts": [
                        files[0],
                    ],
            },

        ]
    )

    # get the response
    response = chat_session.send_message("OCR the given pdf in a structured manner and organize it based on the page number."
                                         "If you find any diagrams, replace it with the text <Diagram>Text explaining content of diagram in a single short line</Diagram>").text
    
    return response

async def merge_ocr_responses(ocr_response_mistral:str, ocr_response_gemini:str)->str:
    gemini_client = genai.GenerativeModel(
                        model_name="gemini-2.0-flash",
                        generation_config=gemini_generation_config,
                        safety_settings=safety_settings,
                        system_instruction="""You are given two OCR responses from two different OCR engines. 
You will need to merge the responses based on the below instructions:
- The response from Engine 1 contains both the text and images. Images are embedded in the text itself using markdown syntax.
- The text content of Engine 1 is really gibberish but it gets a word or two right, but the images and their locations are accurate.
- The response from Engine 2 contains only the text content and is really accurate.
- Now to merge the responses:
    - You will need to keep the response from Engine 2 as the base response.
    - Use the response from Engine 2 to find the relevant images and where they go.
    - Make sure to include *every* image from Engine 1 in the final response.
    - You will need to ensure that the images are correctly placed in the text content, to do this look for text before and after the image in Engine 1 and compare that to Engine 2 and place the image in the same location in the final response.
- The original responses are organized by page number, but your output needs to be organized by the question number. Understand the text content thoroughly to organize it correctly.
- Output in markdown format
- Any header before the questions start should be added at the top of the response.
"""
    )

    # get the response
    response = gemini_client.generate_content(f"""
    # Engine 1 (Mistral OCR)
    {ocr_response_mistral}
    # Engine 2 (Gemini OCR)
    {ocr_response_gemini}""").text
    response = response.replace("```markdown\n", "")
    response = response.replace("```", "")

    return response
    

def save_images_ocr(ocr_response:OCRResponse,request_id:str=""):
    images = []
    for page in ocr_response.pages:
        page_images = []
        for image in page.images:
            image_data = {
                "image_name": image.id,
                "page_number": page.index,
                "image_base64": image.image_base64
            }
            page_images.append(image_data)
        images.extend(page_images)
    
    # temporary directory to store request content
    if request_id=="":
        request_id = str(uuid.uuid4())
    
    temp_dir = f"./tmp/{request_id}"
    os.makedirs(temp_dir, exist_ok=True)
    for image in images:
        image_path = os.path.join(temp_dir, f"{image['image_name']}")
        with open(image_path, "wb") as buffer:
            buffer.write(base64.b64decode(image["image_base64"].split(',')[1]))
    
    return request_id


def clean_ocr_response_mistral(ocr_response:OCRResponse)->str:
    text = ""
    for page in ocr_response.pages:
        temp = f"# Page {page.index}\n"
        temp += page.markdown
        text += temp
    return text

baseDir = "./public"
@router.post("/check")
async def checkAnswer(file: UploadFile | None = None):
    # Upload file to my server
    if not file:
        return {"message": "No upload file sent"}
    
    file_name = "uploaded_file.pdf"
    os.makedirs(baseDir, exist_ok=True)  # Ensure the directory exists

    # Always keep the file in the public folder named as uploaded_file
    file_path = os.path.join(baseDir, file_name)
    
    #Save the file in the file_path 
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())  # Async read the content and write to file
    
    # calling mistral ocr
    response_mistral = await ocr_response_mistral(file_name, file_path)
    # Save the images from the OCR response
    request_id = save_images_ocr(response_mistral)
    # calling gemini ocr
    response_gemini = await ocr_response_gemini(file_path)
    # clean the OCR response from Mistral
    response_mistral = clean_ocr_response_mistral(response_mistral)
    # merge the OCR responses
    response = await merge_ocr_responses(response_mistral, response_gemini)
    # Remove the file after OCR response
    os.unlink(file_path)

    # also save the response as markdown file in the temp directory
    with open(f"./tmp/{request_id}/response.md", "w") as f:
        f.write(response)

    # Return the OCR response
    return response

