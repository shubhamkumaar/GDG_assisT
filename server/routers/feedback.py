import os
import re
from fastapi import Form, APIRouter, Depends
from typing import Annotated
from pydantic import BaseModel
import google.generativeai as genai
from mistralai import OCRResponse
from functools import lru_cache
import requests
from server import config
from server.utils.gemini import gemini_generation_config,safety_settings, wait_for_files_active, upload_to_gemini
import server.db.models as models
from server.routers.check_answer import ocr_response_mistral, save_images_ocr
from sqlalchemy.orm import Session
from server.db.database import get_db
from server.routers.auth import verify_jwt_token

router = APIRouter(
    tags=["Automation"],
)

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[models.User, Depends(verify_jwt_token)]

@lru_cache
def get_settings():
    return config.Settings()

Settings = get_settings()

gemini_api_key = Settings.GENAI_API_KEY
genai.configure(api_key=gemini_api_key)

def ocr_to_md(ocr_response:OCRResponse)->str:
    """"Converts The OCR Response from Mistral to Markdown"""
    md = ""
    for page in ocr_response.pages:
        md += f"# Page {page.index}\n"
        md += page.markdown
        md += "\n"
    return md

def generate_rubric(job_id:str)->str:
    """job_id is the assignment_id. \n
    Generates a rubric for the assignment based on the Assignment, Answer Key, and any Materials in that class.
    Requires the give_feedback function to have already downloaded the necessary files."""
    job_dir = f"./tmp/{job_id}"
    question_file = f"{job_dir}/question.md" if os.path.exists(f"{job_dir}/question.md") else None
    content_file = f"{job_dir}/question_content.txt"
    materials = os.listdir(f"{job_dir}/materials")
    # check if any file that starts with "answer_file" exists
    ls = os.listdir(job_dir)
    answer_file = None
    for file in ls:
        if file.startswith("answer_file"):
            answer_file = file
            break
        
    with open(content_file, "r") as f:
        content = f.read()

    parts = []
    parts.append(content + "\n\n")
    if question_file is not None:
        with open(question_file, "r") as f:
            parts.append("THE ASSIGNMENT CONTENT:\n====================\n")
            text = f.read()
            image_paths = re.findall(
                r'(?:<img\b[^>]*src\s*=\s*["\']([^"\']*)["\']|!\[[^\]]*\]\(([^)]*)\))', 
                text
            )
            image_paths = [path[0] or path[1] for path in image_paths]
            
            # join the image paths with the job_dir
            image_paths = [f"{job_dir}/{image_path}" for image_path in image_paths]

            files = [
                upload_to_gemini(image_path) 
                for image_path in image_paths
            ]
            wait_for_files_active(files)
            last_end = 0
            file_idx = 0
            pattern = re.compile(r'(<img\b[^>]+>|!\[[^\]]*\]\([^)]*\))')

            for match in pattern.finditer(text):
                start = match.start()
                end = match.end()
                
                # Add text before the current match
                parts.append(text[last_end:start])
                
                # Add the corresponding processed file
                parts.append(files[file_idx])
                file_idx += 1
                
                last_end = end

            # Add remaining text after the last match
            parts.append(text[last_end:])

    if materials:
        parts.append("THE MATERIALS:\n====================\n")
        files = [
            upload_to_gemini(f"{job_dir}/materials/{material}") 
            for material in materials
        ]
        wait_for_files_active(files)
        for file in files:
            parts.append(file)
    
    if answer_file is not None:
        parts.append("THE ANSWER KEY:\n====================\n")
        parts.append(upload_to_gemini(f"{job_dir}/{answer_file}"))

    gemini_client = genai.GenerativeModel(
                        model_name="gemini-2.0-flash-thinking-exp-01-21",
                        generation_config=gemini_generation_config,
                        safety_settings=safety_settings
    )
    
    chat_session = gemini_client.start_chat(
        history=[
            {
                    "role": "user",
                    "parts": parts,
            },
        ]
    )
    prompt = """I have given you an assignment, and I have included the following content:
    - The assignment title
    - The assignment description
    - The actual assignment with its images if any
    - Materials from the class that this assignment is based on if any
    - The answer key if any(It might be the case that I havent included the answer key)
    Now I want you to clearly understand the assignment, the task, the expected answers based on all the materials I have provided youw with and create a detailed rubric for each question in this assingnment on how it should be graded based on the max score per question if given, else take max score = 10.
    You should format your response in the following way:
    - For each question, provide the question number, the question itself, the expected answer, and the rubric.
    - The rubric should be in the form of a table with the following columns:
        - Criteria
        - Points
        - Description
    - The total points should be 10 unless specified otherwise.
    - You should format your response in markdown format.
    - It might be the case that some questions have images with them, so in your final response include those images by using the markdown syntax for images.
    """
    response = chat_session.send_message(prompt).text

    # now we save this response to a file
    with open(f"{job_dir}/rubric.md", "w") as f:
        f.write(response)
    return response
# Endpoint to give feedback
@router.post("/feedback")
def give_feedback(db: db_dependency,submission_id: str = Form(...)):
    #TODO: Actually grade the submission and give feedback
    #TODO: Fix images inside the rubric
    #TODO: Optimize the prompt

    # first we get the corresponding submission
    submission = db.query(models.Submissions).filter(models.Submissions.id == submission_id).first()
    if submission is None:
        return {"error": "Submission not found"}
    
    # check if the feedback has already been generated
    if submission.feedback is not None:
        # it is in the form of a json string in the database
        return {"feedback": submission.feedback}

    # then we get the corresponding assignment
    assignment = db.query(models.Assignments).filter(models.Assignments.id == submission.assignment_id).first()
    
    # then we get the corresponding class
    selected_class = db.query(models.Classes).filter(models.Classes.id == assignment.class_id).first()

    # now we get all the materials of the class
    materials = db.query(models.Materials).filter(models.Materials.class_id == selected_class.id).all()
    material_files = [
                        {
                            "title": material.material_name,
                            "description": material.description,
                            "file_url": material.material_file
                        } 
                        for material in materials
                    ]
    # now we get the content of the assignment
    question_content = {
        "title" : assignment.assignment_name,
        "question": assignment.assignment_description,
        "file_url": assignment.assignment_file,
        "answer_file": assignment.answer_key
    }
    # now we get the content of the submission
    submission_content = {
        "file_url": submission.submission_file
    }

    # now we create a request_id, we use the submission_id as the job_id 
    # until we have queues implemented
    request_id = submission_id

    # the job_id is the assignment_id as all the submissions under this
    # will have the same material and question content
    job_id = assignment.id

    # So combining both the ids we get the directory where the files will be stored
    temp_dir = f"./tmp/{job_id}/{request_id}"
    temp_dir_job = f"./tmp/{job_id}"
    os.makedirs(temp_dir, exist_ok=True)

    # now, we check whether the question content and material files are already present here
    # if not we download them
    if not os.path.exists(f"{temp_dir_job}/rubric.md"):
        
        # we firstly download the question content if any
        if question_content["file_url"] is not None:
            file_extension = question_content["file_url"].split(".")[-1]
            file_name = f"question_file.{file_extension}"
            file_path = os.path.join(temp_dir_job, file_name)
            response = requests.get(question_content["file_url"])
            with open(file_path, "wb") as f:
                f.write(response.content)
            # if the file is a pdf, we need to convert it to text
            if file_extension == "pdf":
                ocr_response = ocr_response_mistral(file_name, file_path)
                # we convert the ocr response to markdown
                md = ocr_to_md(ocr_response)
                # save images of the question content
                save_images_ocr(ocr_response, job_id, None)
                # save the markdown to a file
                with open(f"{temp_dir_job}/question.md", "w") as f:
                    f.write(md)
            elif file_extension == "txt":
                with open(file_path, "r") as f:
                    md = f.read()
                with open(f"{temp_dir_job}/question.md", "w") as f:
                    f.write(md)
            elif file_extension == "docx" or file_extension == "doc":
                os.system(f"pandoc -f docx -t gfm {file_path} -o {temp_dir_job}/question.md --extract-media={temp_dir_job}")
            else:
                return {"error": "Unsupported file format for question content"}
            

        with open(f"{temp_dir_job}/question_content.txt", "w") as f:
            f.write(f"""Assignment: {assignment.assignment_name}
            {assignment.assignment_description}
            """)

        # now we download the material files
        material_dir = f"{temp_dir_job}/materials"
        os.makedirs(material_dir, exist_ok=True)

        for material in material_files:
            file_name = material["file_url"].split("/")[-1]
            file_path = os.path.join(material_dir, file_name)
            response = requests.get(material["file_url"])
            with open(file_path, "wb") as f:
                f.write(response.content)
        
        # now we download answer if any, again no need to convert to text
        if question_content["answer_file"] is not None:
            file_extension = question_content["answer_file"].split(".")[-1]
            file_name = f"answer_file.{file_extension}"
            file_path = os.path.join(temp_dir_job, file_name)
            response = requests.get(question_content["answer_file"])
            with open(file_path, "wb") as f:
                f.write(response.content)
            
        # now we use gemini to organize this markdown using the question numbers
        rubric = generate_rubric(job_id)

        pass
    else:
        # we use the already present files to generate the rubric
        with open(f"{temp_dir_job}/rubric.md", "r") as f:
            rubric = f.read()
    # next we use this generated rubric to score each question individually and generate feedback
    return {"feedback": rubric}




    


