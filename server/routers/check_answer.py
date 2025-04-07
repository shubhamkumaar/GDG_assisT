import os
import io
import base64
from functools import lru_cache
import re
from typing import Annotated
import uuid
from mistralai import Mistral, OCRResponse
import google.generativeai as genai
from fastapi import APIRouter,File, UploadFile
import requests
from server import config
from server.utils.gemini import gemini_generation_config,safety_settings, wait_for_files_active, upload_to_gemini,gemini_generation_config_thinking

# this probably doesn't need to be a route anymore, but instead a function that is called by another route


router = APIRouter(
    tags=["Automation"],
)

@lru_cache
def get_settings():
    return config.Settings()

Settings = get_settings()

api_key =Settings.MISTRAL_API_KEY
client = Mistral(api_key=api_key)

gemini_api_key = Settings.GENAI_API_KEY
genai.configure(api_key=gemini_api_key)

def ocr_response_mistral(file_name:str, file_path:str):
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

def ocr_response_gemini(file_path:str)->str:
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
                                         "If you find any diagrams or images, replace it with the text <Diagram>Text explaining content of diagram in a single short line</Diagram>"
                                         "Make sure to include explicitly any 'Question No.' such as 'Q.1','Q)1', 'Question 1', 'Ques.1', etc.").text
    
    return response

def merge_ocr_responses(ocr_response_mistral:str, ocr_response_gemini:str)->str:
    gemini_client = genai.GenerativeModel(
                        model_name="gemini-2.0-flash-thinking-exp-01-21",
                        generation_config=gemini_generation_config_thinking,
                        safety_settings=safety_settings,
                        system_instruction="""You are given two OCR responses from two different OCR engines. 
You will need to merge the responses based on the below instructions:
- The response from Engine 1 contains both the text and images. Images are embedded in the text itself using markdown syntax.
- The text content of Engine 1 is unusable and you should not use any of it, nor should you take any inspiration from it.
- The response from Engine 2 contains only the text content and is really accurate.
- Now to merge the responses(Not actuall merge but just add in markdown images from Engine 1 to Engine 2):
    - You will need to keep the response from Engine 2 as the base response.
    - Use the response from Engine 2 to find the relevant images and where they go.
    - Make sure to include *every* image from Engine 1 in the final response.
    - You will need to ensure that the images are correctly placed in the text content, to do this look for text before and after the image in Engine 1 and compare that to Engine 2 and place the image in the same location in the final response.
    - Engine 2 might have diagrams in the form of <Diagram>Text explaining content of diagram in a single short line</Diagram>, this is only for your ease of understanding what goes where and should not be included in the final response, instead, replace it by including the images from Engine 1 in the correct markdown format.
- The original responses are organized by page number, but your output needs to be organized by the question number. Understand the text content thoroughly to organize it correctly.
- You can generally tell a question from the other using:
    - Whenever a question starts, there must be a question number.
    - The text content inside the question might span multiple pages.
    - Use your best judgment to understand where a question starts and ends.
    - Make sure you don't convert big headings into extra questions, only start a new question if you see a question number.
- Use h1 headers only for the question number. For the top header use h2. For parts inside a question use h3.
- Do not ever use h1 headers `# ` for anything other than the question number, however important it may seem.
- Only write the question number and its corresponding answer, dont actually make up the question.
- Output in markdown format
- Any header before the questions start should be added at the top of the response.
"""
    )

    # get the response
    response = gemini_client.generate_content(f"""
    # Engine 1 (Bad OCR)
    {ocr_response_mistral}
    # Engine 2 (Good OCR)
    {ocr_response_gemini}""").text
    response = response.replace("```markdown\n", "")
    response = response.replace("```", "")

    return response
    

def save_images_ocr(ocr_response:OCRResponse,job_id:str,request_id:str="")->tuple:
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
    
    temp_dir = f"./tmp/{job_id}/{request_id}"

    if request_id==None:
        temp_dir = f"./tmp/{job_id}"

    os.makedirs(temp_dir, exist_ok=True)
    for image in images:
        image_path = os.path.join(temp_dir, f"{image['image_name']}")
        with open(image_path, "wb") as buffer:
            buffer.write(base64.b64decode(image["image_base64"].split(',')[1]))
    
    return f"{job_id}/{request_id}", images[-1]["image_name"] if len(images)>0 else None


def clean_ocr_response_mistral(ocr_response:OCRResponse)->str:
    text = ""
    for page in ocr_response.pages:
        temp = f"# Page {page.index}\n"
        temp += page.markdown
        text += temp
    return text

def ocr_answer_submission(file_url:str,job_id:str,request_id:str):
    # create a request id
    temp_dir = f"./tmp/{job_id}/{request_id}"
    os.makedirs(temp_dir, exist_ok=True)

    # download the file to the temp directory, name the file submission.pdf
    file_name = "submission.pdf"
    file_path = os.path.join(temp_dir, file_name)
    response = requests.get(file_url)

    with open(file_path, "wb") as f:
        f.write(response.content)
    
    # calling mistral ocr
    response_mistral = ocr_response_mistral(file_name, file_path)
    # Save the images from the OCR response
    request_id, last_image = save_images_ocr(response_mistral, job_id, request_id)
    # calling gemini ocr
    response_gemini = ocr_response_gemini(file_path)
    # clean the OCR response from Mistral
    response_mistral = clean_ocr_response_mistral(response_mistral)
    # merge the OCR responses
    response = merge_ocr_responses(response_mistral, response_gemini)
    # Remove the file after OCR response
    # os.unlink(file_path)

    # firstly check if there are any images in the response
    if last_image is not None:
        # clean response to include any extra images than there should be
        last_image_n = re.findall(r'\d+', last_image)
        split_last_image = last_image.split(last_image_n[0])
        last_image_n = int(last_image_n[0])
        # surely there are no more than 100 extra images :D
        for i in range(1, last_image_n+100):
            response.replace(f"![{split_last_image[0]}{i}{split_last_image[1]}", "")

    # also save the response as markdown file in the temp directory
    with open(f"{temp_dir}/response.md", "w") as f:
        f.write(response)

    # Return the OCR response
    return {"request_id": request_id, "response": response}

@router.post("/check")
async def ocr_submission(file_url:str, job_id:str):
    # create a request id
    request_id = str(uuid.uuid4())
    return ocr_answer_submission(file_url, job_id, request_id)