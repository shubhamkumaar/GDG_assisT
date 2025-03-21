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
from server.utils.gemini import gemini_generation_config,safety_settings, wait_for_files_active, upload_to_gemini, gemini_generation_config_thinking
import server.db.models as models
from server.routers.check_answer import ocr_response_mistral, save_images_ocr, ocr_response_gemini, ocr_answer_submission
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

def split_questions(text):
    # regex to find markdown h1 headers
    split_list = re.split(r'(^# .+$)', text, flags=re.MULTILINE)
    
    questions = []
    # iterate over split parts starting from the first header
    for i in range(1, len(split_list), 2):
        header = split_list[i].strip()  # Get the H1 header
        content = split_list[i+1].strip() if (i + 1) < len(split_list) else ''
        questions.append(f"{header}\n{content}")
    
    return questions

def ocr_to_md(ocr_response:OCRResponse)->str:
    """"Converts The OCR Response from Mistral to Markdown"""
    md = ""
    for page in ocr_response.pages:
        md += f"# Page {page.index}\n"
        md += page.markdown
        md += "\n"
    return md

def merge_ocr_responses(ocr_response_mistral:str, ocr_response_gemini:str)->str:
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
    - Engine 2 might have diagrams in the form of <Diagram>Text explaining content of diagram in a single short line</Diagram>, this is only for your ease of understanding what goes where and should not be included in the final response, instead, replace it by including the images from Engine 1 in the correct markdown format.
- The original responses are organized by page number, but your output needs to be organized by the question number. Understand the text content thoroughly to organize it correctly.
- You can generally tell a question from the other using:
    - Whenever a question starts, there must be a question number.
    - Sometimes a question might span 1-2 pages.
    - Use your best judgment to understand where a question starts and ends.
- Use h1 headers only for the question number. For the top header use h2.
- Only write the question number and its corresponding answer, dont actually make up the question.
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

def render_images_markdown(text:str,job_dir:str,parts:list)->list:
    image_paths = re.findall(
        r'(?:<img\b[^>]*src\s*=\s*["\']([^"\']*)["\']|!\[[^\]]*\]\(([^)]*)\))', 
        text
    )
    image_paths = [path[0] or path[1] for path in image_paths]
    temp_image = image_paths
    
    # convert full paths to absolute paths relative to the job_dir, 
    # for example ./tmp/3/media/image1.png to ./media/image1.png
    image_paths = [
        path.split(f"{job_dir}/")[1] if path.startswith(f"{job_dir}/") else path
        for path in image_paths
    ]

    # join the image paths with the job_dir
    image_paths = [f"{job_dir}/{image_path}" for image_path in image_paths]

    files = [
        upload_to_gemini(image_path) 
        for image_path in image_paths
    ]
    last_end = 0
    file_idx = 0
    pattern = re.compile(r'(<img\b[^>]+>|!\[[^\]]*\]\([^)]*\))')

    for match in pattern.finditer(text):
        start = match.start()
        end = match.end()
        
        # Add text before the current match
        parts.append(text[last_end:start] + temp_image[file_idx])
        
        # Add the corresponding processed file
        parts.append(files[file_idx])
        file_idx += 1
        
        last_end = end

    # Add remaining text after the last match
    parts.append(text[last_end:])
    return parts
        
def clean_pandoc_md(md:str)->str:
    gemini_client = genai.GenerativeModel(
                        model_name="gemini-2.0-flash",
                        generation_config=gemini_generation_config,
                        safety_settings=safety_settings,
                        system_instruction="""You are given a markdown file that is the result of a pandoc conversion. 
Now you need to clean up the markdown file based on the below instructions:
- Do general cleanup but do not remove information from the file. For e.g. do not remove any images, headers, lists, marks weightage, etc.
- There might be some header before the questions, use h2 headers for them.
- Use h1 headers only for the question number and h2 for the question itself.
- Use h3 headers for any subheadings inside the question, for any subquestions and similar.
- Do not use h1 for anything else other than the question number."""
    )
    response = gemini_client.generate_content(md).text
    response = response.replace("```markdown\n", "")
    return response

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
            parts = render_images_markdown(text, job_dir, parts)

    if materials:
        parts.append("THE MATERIALS:\n====================\n")
        files = [
            upload_to_gemini(f"{job_dir}/materials/{material}") 
            for material in materials
        ]
        for file in files:
            parts.append(file)
    
    if answer_file is not None:
        parts.append("THE ANSWER KEY:\n====================\n")
        parts.append(upload_to_gemini(f"{job_dir}/{answer_file}"))

    if materials or answer_file:
        wait_for_files_active(files)

    gemini_client = genai.GenerativeModel(
                        model_name="gemini-2.0-flash-thinking-exp-01-21",
                        generation_config=gemini_generation_config_thinking,
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
    - It might be the case that some questions have images with them, so in your final response include those images by using the markdown syntax for images. For example, lets say the image is named "image.png", then you should include it in your markdown response as ![Image](image.png)
    - Use h1 tags only for the question number, and h2 tag for the question itself, and h3 tags for any subheadings inside that question like rubric, and expected answer.
    """
    response = chat_session.send_message(prompt).text
    response = response.replace("```markdown\n", "")
    
    # now we save this response to a file
    with open(f"{job_dir}/rubric.md", "w") as f:
        f.write(response)
    return response

def process_question_content_pdf(file_path:str, file_name:str, temp_dir:str, job_id:str):
    """Converts a PDF file to text and saves it in the temp_dir"""
    # ocr the pdf from mistral
    ocr_mistral = ocr_response_mistral(file_name, file_path)
    # save images of the question content
    save_images_ocr(ocr_mistral, job_id, None)
    # we convert the ocr response to markdown
    ocr_mistral = ocr_to_md(ocr_mistral)
    # ocr response from gemini
    ocr_gemini = ocr_response_gemini(file_path)
    # merge the ocr responses
    md = merge_ocr_responses(ocr_mistral, ocr_gemini)
    # save the markdown to a file
    with open(f"{temp_dir}/question.md", "w") as f:
        f.write(md)

def grade_one_question(rubric:str, answer:str, job_id:str, request_id:str):
    gemini_client = genai.GenerativeModel(
                        model_name="gemini-2.0-flash-thinking-exp-01-21",
                        generation_config=gemini_generation_config_thinking,
                        safety_settings=safety_settings,
                        system_instruction="""You will be given a question along with its expected answer and the grading rubric.
You will also be given an answer that you will need to grade on the basis of the rubric.
Your response should contain the following:
- A section for explanation of the grading.
- A section telling the final score.
- A section containing the feedback for the student on how they can improve.
- A section containing any strengths shown in the answer (if any).
- A section containing any areas of improvement in the answer (if any).
    - Based on the above section you can also suggest resources that the student can use to improve.
- You should create the sections for the strengths, areas of improvement, and resources but you need to only fill them if you have actual reasoning behind them.
- Dont give feedbacks for strengths and areas of improvement for the sake of doing it, it is *entirely* optional. You need solid evidence to back up your claims.
- The answer that you recieve has been automaticall OCR'd from a pdf, so there *will* be a lot of errors in the text, most importantly spelling errors and random characters. You need to keep that in mind while grading.
- Please do not keep your feedback generic and overly verbose, and do not nitpick on things too much, remember a good feedback is one that is constructive and helps the student improve.
- Output in markdown format.
"""
    )
    parts = []
    parts.append(f"The Question and Rubric:\n================\n{rubric}\n\nThe Answer:\n================\n")
    parts = render_images_markdown(answer, f"./tmp/{job_id}/{request_id}", parts)
    chat_session = gemini_client.start_chat(
        history=[
            {
                    "role": "user",
                    "parts": parts,
            },
        ]
    )
    response = chat_session.send_message("Grade the given answer based on the rubric provided.").text
    response = response.replace("```markdown\n", "")
    return response
# Endpoint to give feedback
@router.post("/feedback")
def give_feedback(db: db_dependency,submission_id: str = Form(...)):
    #TODO: Actually grade the submission and give feedback
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
                process_question_content_pdf(file_path, file_name, temp_dir_job, job_id)
            # if the file is a plain txt file, that means no images, so we can directly use it 
            elif file_extension == "txt":
                with open(file_path, "r") as f:
                    md = f.read()
                with open(f"{temp_dir_job}/question.md", "w") as f:
                    f.write(md)
            # if the file is a docx, we need to convert it to markdown
            # there aren't many good libraries for this so we use pandoc
            # the images are in ./media directory relative to the markdown file
            elif file_extension == "docx" or file_extension == "doc":
                os.system(f"pandoc -f docx -t gfm {file_path} -o {temp_dir_job}/question.md --extract-media={temp_dir_job}")
                with open(f"{temp_dir_job}/question.md", "r") as f:
                    md = f.read()
                md = clean_pandoc_md(md)
                with open(f"{temp_dir_job}/question.md", "w") as f:
                    f.write(md)
            else:
                return {"error": "Unsupported file format for question content"}
            
        # some assignments might have the questions in the description itself
        with open(f"{temp_dir_job}/question_content.txt", "w") as f:
            f.write(f"""Assignment: {assignment.assignment_name}
            {assignment.assignment_description}
            """)

        # download the material files
        material_dir = f"{temp_dir_job}/materials"
        os.makedirs(material_dir, exist_ok=True)

        for material in material_files:
            file_name = material["file_url"].split("/")[-1]
            file_path = os.path.join(material_dir, file_name)
            response = requests.get(material["file_url"])
            with open(file_path, "wb") as f:
                f.write(response.content)
        
        # download answer if any, again no need to convert to text
        if question_content["answer_file"] is not None:
            file_extension = question_content["answer_file"].split(".")[-1]
            file_name = f"answer_file.{file_extension}"
            file_path = os.path.join(temp_dir_job, file_name)
            response = requests.get(question_content["answer_file"])
            with open(file_path, "wb") as f:
                f.write(response.content)
            
        # now we use gemini to organize this markdown using the question numbers
        rubric = generate_rubric(job_id)
    else:
        # we use the already present files to generate the rubric
        with open(f"{temp_dir_job}/rubric.md", "r") as f:
            rubric = f.read()
    
    # ocr the submitted the answer
    response = ocr_answer_submission(submission_content["file_url"], job_id, request_id)
    # now split the questions and the answers as well
    questions = split_questions(rubric)
    answers = split_questions(response["response"])

    # now we grade each question
    feedback = []
    for i in range(len(questions)):
        feedback.append(grade_one_question(questions[i], answers[i], job_id, request_id))

    # saving temporarily to the request directory
    with open(f"{temp_dir}/feedback.md", "w") as f:
        f.write("\n\n".join(feedback))
    return {"feedback": feedback}




    


