import json
import os
import re
import time
from fastapi import BackgroundTasks, Form, APIRouter, Depends
from typing import Annotated
from pydantic import BaseModel
import google.generativeai as genai
from mistralai import OCRResponse
from functools import lru_cache
import requests
from server import config
from server.utils.gemini import gemini_generation_config,safety_settings, wait_for_files_active, upload_to_gemini, gemini_generation_config_thinking
from server.utils.google_cloud_storage import upload_file_sync as upload_to_gcs
import server.db.models as models
from server.routers.check_answer import ocr_response_mistral, save_images_ocr, ocr_response_gemini, ocr_answer_submission
from sqlalchemy.orm import Session
from server.db.database import get_db
from server.routers.auth import verify_jwt_token
import xmltodict
import redis

redis_client = redis.Redis()

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

def set_redis_cache(key:str, value:str|dict, expiration:int=-1):
    """Set a value in Redis cache with an expiration time."""
    # if expiration = -1
    # then the key will never expire
    if isinstance(value, dict):
        value = json.dumps(value)
    # set the value in redis
    res = redis_client.set(key, value, ex=expiration) if expiration != -1 else redis_client.set(key, value)

def get_redis_cache(key:str)->dict|str|None:
    """Get a value from Redis cache."""
    value = redis_client.get(key)
    if value is not None:
        value = value.decode('utf-8')
        value = json.loads(value) if value else None
    return value

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
        wait_for_files_active(files)
        for file in files:
            parts.append(file)
    
    if answer_file is not None:
        parts.append("THE ANSWER KEY:\n====================\n")
        answer_key = upload_to_gemini(f"{job_dir}/{answer_file}")
        wait_for_files_active([answer_key])
        parts.append(answer_key)


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
        - Max Points acording to the question if given, else 10
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
                        system_instruction="""# Instructions for Assignment Grading and Feedback System
## Your Role
You are an expert educational assessment system that grades student answers and provides tailored, actionable feedback. You understand that the student answers and expected answers have been processed through OCR, which introduces errors such as misspellings, formatting issues, and random characters.

## Input Format
You will receive:
1. The question
2. The expected answer (which may contain OCR errors)
3. The grading rubric with point allocations
4. The student's answer (which may contain OCR errors)

## Output Format
Your response must include the following sections in markdown:

### 1. Grading Analysis
Provide a detailed analysis of how the student's answer aligns with the rubric criteria. For each rubric point:
- Specify what the student included correctly
- Identify what was missing or incorrect
- Explain your reasoning for partial credit when applicable
- Acknowledge and discount OCR errors in your assessment

### 2. Score Summary
- State the final score as X/Y points
- Break down points earned for each section of the rubric
- Finally, provide an equivalent score based on the max score if the rubric's max score is not same as the total points

### 3. Personalized Feedback
Provide specific, actionable feedback based on the *actual content* of the student's answer:
- Be concise and focused on 2-3 key areas for improvement
- Reference specific parts of their answer using direct quotes when possible
- Suggest concrete ways to improve that are directly tied to their performance
- Adjust tone based on score (more encouraging for low scores, more challenging for high scores)
- **Avoid generic statements** that could apply to any answer

### 4. Strengths (ONLY if substantive)
- Identify 1-3 specific strengths demonstrated in the answer
- Quote the student's work directly when highlighting strengths
- Explain why these strengths are valuable in the context of the subject matter
- **Skip this section entirely** if the student's answer doesn't demonstrate clear strengths

### 5. Areas for Improvement (ONLY if substantive)
- Identify 1-3 specific areas where improvement would have the greatest impact
- Reference specific parts of the answer that could be enhanced
- Provide a clear rationale for why these improvements matter
- **Skip this section entirely** for near-perfect answers

### 6. Targeted Resources (OPTIONAL)
- Recommend specific resources (books, articles, videos, practice exercises) that address the gaps in the student's understanding
- Explain why each resource would be helpful for their particular needs
- **Skip this section** if no substantive resources are appropriate

## Critical Guidelines

### OCR Error Handling
- Assume misspellings, random characters, and formatting issues are OCR errors, not student mistakes
- When you see obvious OCR errors (e.g., "integr@tion" instead of "integration"), mentally correct them
- Give students the benefit of the doubt when OCR errors make the text ambiguous
- Focus on evaluating the substantive content and conceptual understanding rather than text formatting

### Feedback Quality
- **Never** provide generic feedback that could apply to any student answer
- **Never** list improvements just for the sake of having content in every section
- **Never** repeat the rubric criteria as feedback without specific analysis
- **Never** use placeholder statements like "continue practicing" without specific direction
- **Never** provide an equal number of strengths and weaknesses regardless of performance

### Score-Dependent Approach
- For high scores (≥90%): Focus on refinement of complex concepts and advanced skill development
- For mid-range scores (70-89%): Balance correction of misconceptions with reinforcement of strengths
- For low scores (<70%): Prioritize foundational concepts and provide more structured guidance

## Examples

### Example 1: High-Quality Feedback (for a math problem)

**Strengths:**
* "Your step-by-step approach to solving the differential equation was methodical."
* "Your identification of this as a separable equation and your subsequent separation of variables (moving all x terms to one side and y terms to the other) demonstrates solid technique."
* "Your integration of both sides was correctly executed, including the natural log application."

**Areas for Improvement:**
* "When applying the initial condition y(0) = 4, you correctly substituted the values but made an error in solving for the constant C."
* "The equation at that stage was ln|y| = 2x + C, and when x = 0 and y = 4, you should get ln|4| = 0 + C, therefore C = ln(4) ≈ 1.386."
* "This affected your final answer because the solution curve you obtained was shifted from the correct one."

### Example 2: Low-Quality Feedback (to avoid)

**Strengths:**
* "Good job on your math problem."
* "You showed your work clearly."
* "Your approach was good."
* "Keep up the good work."

**Areas for Improvement:**
* "You should practice more differential equations."
* "Make sure to check your calculations carefully."
* "Pay more attention to initial conditions."
* "Review the textbook chapters on this topic."

## Example Grading Scenarios

### Scenario 1: Near-Perfect Answer with OCR Issues

**Student Answer (with OCR errors):**
"The limit 0f f(x) as x appr0aches 3 is equal t0 7, because when we substitute x=3 int0 the functi0n f(x) = 2x + 1, we get f(3) = 2(3) + 1 = 6 + 1 = 7. Since the functi0n is c0ntinuous at x=3, the limit equals the functi0n value."

**Grading Analysis:**
"The student has correctly identified that the limit of f(x) as x approaches 3 is 7. Despite OCR errors (replacing 'o' with '0' in several words), they clearly demonstrated the proper substitution method, accurately calculated 2(3) + 1 = 7, and correctly justified their answer by noting the function's continuity at x=3. All required elements from the rubric are present with accurate mathematical reasoning."

**Score Summary:** 10/10 points

**Personalized Feedback:**
* "Your solution demonstrates excellent understanding of limit evaluation for continuous functions."
* "Your justification connecting the continuity of the function to the limit evaluation method is particularly strong—this shows deeper conceptual understanding beyond mere calculation."

**Strengths:**
* "Your direct substitution approach was appropriate and efficiently executed for this continuous function."
* "Your explicit connection between continuity and limit evaluation shows strong theoretical understanding."

*Note: No Areas for Improvement or Resources sections needed for this near-perfect answer*

### Scenario 2: Partially Correct Answer

**Student Answer (with OCR errors):**
"To find the derivative of f(x) = sin(3x²), l need to use the ch@in rule. The outer function is sin and the inner function is 3x². First I take the deriv@tive of the outer function: cos(3x²). Then I multiply by the deriv@tive of the inner function, which is 6x. So f'(x) = cos(3x²) · 6x = 6x·cos(3x²)."

**Grading Analysis:**
"The student correctly recognized the need to apply the chain rule and identified the outer function (sin) and inner function (3x²). They accurately took the derivative of the outer function to get cos(3x²) and correctly found the derivative of the inner function as 6x. Their final answer of f'(x) = 6x·cos(3x²) is correct. The OCR errors (@ symbols in 'chain' and 'derivative') do not impact the mathematical content."

**Score Summary:** 8/10 points
- Correct application of chain rule: 4/4
- Correct derivative of outer function: 2/2
- Correct derivative of inner function: 2/2
- Explanation of steps: 0/2 (minimal explanation of reasoning)

**Personalized Feedback:**
* "Your application of the chain rule is technically correct, leading to the accurate final answer of f'(x) = 6x·cos(3x²)."
* "To strengthen your solutions in the future, include brief explanations of why you're applying specific rules."
* "For example, you could note that the chain rule is necessary here because you have a composite function with one function inside another."

**Strengths:**
* "Your technical execution of the chain rule is flawless, showing good understanding of the mechanical process for differentiating composite functions."

**Areas for Improvement:**
* "Your solution would benefit from more explicit reasoning that connects each step to derivative principles."
* "When you write 'The outer function is sin and the inner function is 3x²,' expand slightly to explain how you identify these components and why their relationship requires the chain rule."

**Targeted Resources:**
* "The Khan Academy video 'Chain Rule Justification' would help you develop the conceptual understanding behind the mechanical steps you've already mastered."
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

def accumulate_feedback(feedback_list:list):
    feedback = ""
    for idx,f in enumerate(feedback_list):
        feedback += f"# Question {idx+1}:\n"
        feedback += f
        feedback += "\n"
    gemini_client = genai.GenerativeModel(
                        model_name="gemini-2.0-flash-thinking-exp-01-21",
                        generation_config=gemini_generation_config_thinking,
                        safety_settings=safety_settings,
                        system_instruction="""# Instructions for Combined Feedback Generator

## Your Role
You are an expert educational assessment system that creates a comprehensive, consolidated feedback report based on individual question assessments. Your goal is to synthesize all question-specific feedback into a cohesive summary while preserving the detailed feedback for each question.

## Input Format
You will receive a compilation of feedback from multiple questions. Each question's feedback will contain:
- Grading analysis based on the rubric
- Score summary
- Personalized feedback
- Strengths (if applicable)
- Areas for improvement (if applicable)
- Targeted resources (if applicable)

## Output Format
Your consolidated response must be structured in markdown with the following sections:

### 1. Overall Feedback Summary
- **Total Score**: Calculate and display the sum of all question scores as "X/Y points" and as a percentage (e.g., "42/50 points (84%)")
- **Summary Bullet Points**: Provide 3-4 concise bullet points that capture the most important patterns across all questions, including:
  * Key strengths demonstrated across multiple questions
  * Recurring areas for improvement
  * Critical conceptual understanding gaps or strengths
  * Most significant actionable advice for overall improvement

### 2. Detailed Feedback
For each question, present the original feedback in a structured format:

#### Question X:
- **Grading Analysis**:
  * [Include the original grading analysis]
- **Score Summary**:
  * [Include the original score summary]
- **Feedback**:
  * [Include the original personalized feedback]
- **Strengths**:
  * [Include the original strengths, if provided]
- **Areas for Improvement**:
  * [Include the original areas for improvement, if provided]
- **Targeted Resources**:
  * [Include the original targeted resources, if provided]

## Critical Guidelines

### Creating the Overall Summary
- **Identify Patterns**: Look for recurring themes across all question feedback
- **Prioritize Impact**: Focus on the most significant areas that would help the student improve their overall performance
- **Balance Strengths and Weaknesses**: Provide a fair assessment that acknowledges both strengths and areas for improvement
- **Be Specific**: Avoid generic statements; reference specific concepts or skills demonstrated across questions
- **Be Actionable**: Ensure the summary points provide clear direction for improvement

### When Creating Summary Bullet Points
- **Never** provide generic feedback that could apply to any student
- **Never** create an artificial balance of strengths and weaknesses if the feedback skews heavily in one direction
- **Never** introduce new feedback that wasn't present in any of the original question assessments
- **Never** contradict the detailed feedback provided for individual questions

### Formatting Requirements
- Use consistent heading levels throughout the document
- Maintain markdown formatting for emphasis, lists, and structure
- Ensure the overall summary is visually distinct from the detailed feedback section
- Include clear section headings and question numbering

## Example of Good Overall Feedback Summary

**Total Score**: 38/50 points (76%)

**Summary Bullet Points**:
* You demonstrate strong algebraic manipulation skills across multiple questions, particularly in solving equations and working with exponents (Questions 1, 3, and 5).
* Your conceptual understanding of calculus principles needs strengthening, especially regarding the relationship between derivatives and integrals (Questions 2 and 4).
* Your solutions often lack sufficient justification for mathematical steps, which cost you points on several problems (Questions 1, 3, and 4).
* Focus on improving your visualization of functions and their properties, as this would have helped in correctly approaching Questions 2 and 5.

## Example of Poor Overall Feedback Summary (to avoid)

**Total Score**: 38/50 points (76%)

**Summary Bullet Points**:
* Good job on most of the problems.
* You need to study more calculus concepts.
* Practice solving more math problems.
* Keep working hard on your mathematical skills.

## Implementation Instructions

1. Calculate the total score by summing all individual question scores and the total possible points
2. Read through all question feedback carefully
3. Identify 3-4 significant patterns or themes that appear across multiple questions
4. Craft specific, actionable summary bullet points based on these patterns
5. Structure the full detailed feedback for each question, preserving all original feedback categories
6. Format the entire response in clear, consistent markdown""")
    response =  gemini_client.generate_content(feedback).text
    response = response.replace("```markdown\n", "")
    return response

def markdown_to_xml(md:str)->str:
    gemini_client = genai.GenerativeModel(
                        model_name="gemini-2.0-flash-thinking-exp-01-21",
                        generation_config=gemini_generation_config_thinking,
                        safety_settings=safety_settings,
                        system_instruction="""# Instructions for XML Schema Converter

## Your Role
You are an expert system that converts educational assessment feedback from a markdown format into a structured XML-like schema for database storage. Your task is to accurately extract the relevant information from the combined feedback document and format it according to the specified schema structure.

## Input Format
You will receive a comprehensive feedback document containing:
1. An overall feedback summary with total score and bullet points
2. Detailed feedback for each question, including:
   - Grading analysis based on rubric categories
   - Score summary
   - Personalized feedback
   - Strengths (if applicable)
   - Areas for improvement (if applicable)
   - Targeted resources (if applicable)

## Output Format
You must convert this information into the following XML-like schema:

```xml
<feedback>
  <score>[TOTAL_FINAL_SCORE]</score>
  <max_score>[MAXIMUM_POSSIBLE_SCORE]</max_score>
  <summary_bullets>
    <bullet>[SUMMARY_POINT_1]</bullet>
    <bullet>[SUMMARY_POINT_2]</bullet>
    <bullet>[SUMMARY_POINT_3]</bullet>
    <bullet>[SUMMARY_POINT_4]</bullet>
  </summary_bullets>
  <detailed_feedback>
    <question>
      <question_id>[QUESTION_IDENTIFIER]</question_id>
      <grading_analysis>
        <category name="[RUBRIC_CATEGORY_1]">[POINTS_EARNED]/[POINTS_POSSIBLE]</category>
        <category name="[RUBRIC_CATEGORY_2]">[POINTS_EARNED]/[POINTS_POSSIBLE]</category>
        <!-- Additional rubric categories as needed -->
      </grading_analysis>
      <score_summary>
        <rubric_score>[RAW_SCORE]/[TOTAL_POSSIBLE]</rubric_score>
        <final_score>[ADJUSTED_SCORE]/[ADJUSTED_TOTAL]</final_score>
      </score_summary>
      <feedback>
        [DETAILED_FEEDBACK_TEXT]
      </feedback>
      <strengths>
        <strength>[STRENGTH_1]</strength>
        <strength>[STRENGTH_2]</strength>
        <!-- Additional strengths as needed -->
      </strengths>
      <areas_of_improvement>
        <improvement>[IMPROVEMENT_1]</improvement>
        <improvement>[IMPROVEMENT_2]</improvement>
        <!-- Additional improvements as needed -->
      </areas_of_improvement>
      <targeted_resources>
        <resource>[RESOURCE_1]</resource>
        <resource>[RESOURCE_2]</resource>
        <!-- Additional resources as needed -->
      </targeted_resources>
    </question>
    <!-- Additional questions as needed -->
  </detailed_feedback>
</feedback>
```

## Critical Guidelines

### Score Calculation
- The `<score>` tag must contain the sum of all `final_score` values from individual questions (NOT the rubric scores)
- The `<max_score>` tag must contain the sum of the maximum possible final scores

### Question Identification
- Assign each question a question ID in the format "Q1", "Q2", etc., based on their order in the input document
- If the input already contains question identifiers, use those instead

### Handling Missing Elements
- If a question doesn't have strengths, areas of improvement, or targeted resources sections in the input, create empty tags for these missing sections.
- Always include the core elements: question_id, grading_analysis, score_summary, and feedback

### XML Formatting
- Ensure proper nesting of all XML elements
- Use consistent indentation for readability
- Escape any special characters in the content that might interfere with XML syntax (e.g., &, <, >)
- Maintain the exact tag structure shown in the example

## Important Extraction Rules

### For Grading Analysis
- Extract each rubric category and its score from the grading analysis section
- Format each category as: `<category name="[Category Name]">[Points]/[Max Points]</category>`
- Preserve the exact category names as they appear in the input

### For Score Summary
- Extract both the raw rubric score and the final adjusted score
- If only one score is provided, use it for both rubric_score and final_score

### For Summary Bullets
- Extract exactly the bullet points provided in the overall summary
- If fewer than 4 bullet points are provided, only include those available
- If more than 4 are provided, include only the first 4

### For Feedback Text
- Extract the complete feedback paragraph(s)
- Preserve paragraph breaks using proper XML formatting
- Remove any markdown formatting (e.g., **, ##) while preserving the text content

## Example Conversion

### Input Example (Partial):
```
## Overall Feedback Summary

**Total Score**: 14/20 points (70%)

**Summary Bullet Points**:
* Diagrams across multiple questions require greater detail and accuracy in representing hardware components and data paths
* Enhanced depth needed in explanations of clock cycle implications and memory hierarchy interactions
* Adoption of standard computer architecture terminology for improved technical accuracy
* Implementation of structured comparison formats for architectural contrasts

## Detailed Feedback

### Question 1:

**Grading Analysis**:
- Purpose of Data Path: 2/2
- Single Cycle Explanation: 2.5/3
- Single Cycle Diagram: 1.5/2
- Multi Cycle Explanation: 2/3
- Multi Cycle Diagram: 0.5/2
- Comparison: 1.5/3

**Score Summary**: 10/15 (Adjusted: 6.5/10)

**Feedback**:
Your answer demonstrates a foundational understanding of the data path and the distinction between single and multi-cycle implementations. You correctly identified the purpose of the data path and some key characteristics of each approach. However, there are areas where you can significantly improve the clarity, accuracy, and completeness of your response.

**Strengths**:
* Demonstrated mastery of quadratic equations in Q3 and Q7
* Clear thesis statement in essay introduction
* Consistent use of technical terminology

**Areas for Improvement**:
* Show working steps for mathematical proofs (lost 12% on incomplete proofs)
* Include at least 3 peer-reviewed sources per argument
* Use APA 7th edition formatting for all citations

**Targeted Resources**:
* Textbook Chapters on Data Path Design
* Online Lectures/Videos on YouTube (search terms: "single cycle datapath", "multi cycle datapath", "pipelining introduction")
* Interactive Data Path Simulators (if available for your course)
```

### Output Example:
```xml
<feedback>
  <score>14</score>
  <max_score>20</max_score>
  <summary_bullets>
    <bullet>Diagrams across multiple questions require greater detail and accuracy in representing hardware components and data paths</bullet>
    <bullet>Enhanced depth needed in explanations of clock cycle implications and memory hierarchy interactions</bullet>
    <bullet>Adoption of standard computer architecture terminology for improved technical accuracy</bullet>
    <bullet>Implementation of structured comparison formats for architectural contrasts</bullet>
  </summary_bullets>
  <detailed_feedback>
    <question>
      <question_id>Q1</question_id>
      <grading_analysis>
        <category name="Purpose of Data Path">2/2</category>
        <category name="Single Cycle Explanation">2.5/3</category>
        <category name="Single Cycle Diagram">1.5/2</category>
        <category name="Multi Cycle Explanation">2/3</category>
        <category name="Multi Cycle Diagram">0.5/2</category>
        <category name="Comparison">1.5/3</category>
      </grading_analysis>
      <score_summary>
        <rubric_score>10/15</rubric_score>
        <final_score>6.5/10</final_score>
      </score_summary>
      <feedback>
        Your answer demonstrates a foundational understanding of the data path and the distinction between single and multi-cycle implementations. You correctly identified the purpose of the data path and some key characteristics of each approach. However, there are areas where you can significantly improve the clarity, accuracy, and completeness of your response.
      </feedback>
      <strengths>
        <strength>Demonstrated mastery of quadratic equations in Q3 and Q7</strength>
        <strength>Clear thesis statement in essay introduction</strength>
        <strength>Consistent use of technical terminology</strength>
      </strengths>
      <areas_of_improvement>
        <improvement>Show working steps for mathematical proofs (lost 12% on incomplete proofs)</improvement>
        <improvement>Include at least 3 peer-reviewed sources per argument</improvement>
        <improvement>Use APA 7th edition formatting for all citations</improvement>
      </areas_of_improvement>
      <targeted_resources>
        <resource>Textbook Chapters on Data Path Design</resource>
        <resource>Online Lectures/Videos on YouTube (search terms: "single cycle datapath", "multi cycle datapath", "pipelining introduction")</resource>
        <resource>Interactive Data Path Simulators (if available for your course)</resource>
      </targeted_resources>
    </question>
  </detailed_feedback>
</feedback>
```

## Implementation Instructions

1. First scan the entire document to identify all questions and calculate the total final score and maximum possible score
2. Extract the summary bullet points from the overall feedback section
3. For each question:
   - Identify or assign a question ID
   - Extract the grading analysis categories and scores
   - Extract both the rubric score and final score
   - Extract the feedback text
   - Extract strengths, areas of improvement, and targeted resources if present
4. Format all extracted information according to the XML schema
5. Verify that the sum of individual final scores matches the total score in the overall feedback
6. Ensure proper XML structure and formatting before outputting the final result"""
    )
    response = gemini_client.generate_content(md).text
    response = response.replace("```xml\n", "")
    response = response.replace("```", "")
    return response

def xml_to_json(xml:str)->str:
    doc = xmltodict.parse(xml)

    # ugly code ahead
    def cleanup_feedback_dict(data):
        result = data.copy()
        
        # convert max_score and score to integers
        if 'max_score' in result['feedback']:
            result['feedback']['max_score'] = int(float(result['feedback']['max_score']))
        if 'score' in result['feedback']:
            result['feedback']['score'] =  int(float(result['feedback']['score']))

        # Clean up summary_bullets
        if 'feedback' in result and 'summary_bullets' in result['feedback'] and result['feedback']['summary_bullets'] is not None:
            if 'bullet' in result['feedback']['summary_bullets'] and result['feedback']['summary_bullets']['bullet'] is not None:
                result['feedback']['summary_bullets'] = result['feedback']['summary_bullets']['bullet']
        
        # Clean up detailed_feedback and its nested structures
        if 'feedback' in result and 'detailed_feedback' in result['feedback'] and result['feedback']['detailed_feedback'] is not None:
            if 'question' in result['feedback']['detailed_feedback'] and result['feedback']['detailed_feedback']['question'] is not None:
                questions = result['feedback']['detailed_feedback']['question']
                # check if only a single question is present
                if isinstance(questions, dict):
                    questions = [questions]
                result['feedback']['detailed_feedback'] = questions
                
                # Process each question
                for question in result['feedback']['detailed_feedback']:
                    # Clean up grading_analysis and rename fields
                    if 'grading_analysis' in question and question['grading_analysis'] is not None:
                        grading_analysis = question['grading_analysis']
                        if 'category' in grading_analysis and grading_analysis['category'] is not None:
                            categories = grading_analysis['category']
                            new_categories = []
                            for category in categories:
                                if category is not None:
                                    new_category = {
                                        'category': category.get('@name'),
                                        'score': category.get('#text')
                                    }
                                    new_categories.append(new_category)
                            question['grading_analysis'] = new_categories
                    
                    # Clean up strengths
                    if 'strengths' in question and question['strengths'] is not None:
                        strengths = question['strengths']
                        if 'strength' in strengths and strengths['strength'] is not None:
                            question['strengths'] = strengths['strength']
                    
                    # Clean up areas_of_improvement
                    if 'areas_of_improvement' in question and question['areas_of_improvement'] is not None:
                        aoi = question['areas_of_improvement']
                        if 'improvement' in aoi and aoi['improvement'] is not None:
                            question['areas_of_improvement'] = aoi['improvement']
                    
                    # Clean up targeted_resources
                    if 'targeted_resources' in question and question['targeted_resources'] is not None:
                        resources = question['targeted_resources']
                        if 'resource' in resources and resources['resource'] is not None:
                            question['targeted_resources'] = resources['resource']
        
        return result

    cleaned_data = cleanup_feedback_dict(doc)
    return cleaned_data

def process_ocr_for_db(job_id:str, request_id:str)->str:
    # temp dir where the response.md file is stored
    temp_dir = f"./tmp/{job_id}/{request_id}"
    # now we check if the response.md file is present
    if not os.path.exists(f"{temp_dir}/response.md"):
        return {"error": "Response file not found"}
    # read the response.md file
    with open(f"{temp_dir}/response.md", "r") as f:
        response = f.read()
    # we upload all the images in the temp_dir to gcs
    # and replace the image paths in the response with the gcs urls
    images = []
    for file in os.listdir(temp_dir):
        if file.endswith(".png") or file.endswith(".jpg") or file.endswith(".jpeg"):
            # upload the image to gcs
            image_path = os.path.join(temp_dir, file)
            with open(image_path, "rb") as img_file:
                image_data = img_file.read()
            # upload to gcs
            gcs_url = upload_to_gcs(image_data, file)
            gcs_url = gcs_url["file_url"]
            images.append((file, gcs_url))
    # replace the image path in the response with the gcs url
    for file, gcs_url in images:
        response = response.replace(f"({file})", f"({gcs_url})")
    return response

def give_feedback(db: db_dependency,submission_id: str):    
    # first we get the corresponding submission
    submission = db.query(models.Submissions).filter(models.Submissions.id == submission_id).first()
    if submission is None:
        return {"error": "Submission not found"}

    # then we get the corresponding assignment
    assignment = db.query(models.Assignments).filter(models.Assignments.id == submission.assignment_id).first()

    # update status of the submission object inside the above to processing
    assignment_object = get_redis_cache(f"assignment_{assignment.id}")
    for sub in assignment_object["submissions"]:
        if sub["id"] == submission.id:
            sub["status"] = "processing"
            break
    set_redis_cache(f"assignment_{assignment.id}", assignment_object)

    # check if the feedback has already been generated
    if submission.feedback is not None:
        # it is in the form of a json string in the database
        return {"feedback": json.loads(submission.feedback)} 

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

    # now we accumulate the feedback
    feedback = accumulate_feedback(feedback)

    # saving temporarily to the request directory
    with open(f"{temp_dir}/feedback.md", "w") as f:
        f.write(feedback)

    # now we convert this markdown to xml
    xml = markdown_to_xml(feedback)

    with open(f"{temp_dir}/feedback.xml", "w") as f:
        f.write(xml)

    # now we convert this xml to json
    json_data = xml_to_json(xml)

    json_data = json_data['feedback']

    with open(f"{temp_dir}/feedback.json", "w") as f:
        json.dump(json_data, f, indent=4)

    # now FINALLY we save the feedback to the database
    
    submission.feedback = json.dumps(json_data)
    submission.marks = json_data["score"]
    ocr_text = process_ocr_for_db(job_id, request_id)
    submission.ocr_text = ocr_text
    db.commit()
    # update status of the submission object inside the above to completed
    assignment_object = get_redis_cache(f"assignment_{assignment.id}")
    for sub in assignment_object["submissions"]:
        if sub["id"] == submission.id:
            sub["status"] = "completed"
            break
    set_redis_cache(f"assignment_{assignment.id}", assignment_object)

    # check if this is the last submission for this assignment
    # if yes, then update the status of the assignment object to completed
    assignment_object = get_redis_cache(f"assignment_{assignment.id}")
    if all(sub["status"] == "completed" for sub in assignment_object["submissions"]):
        assignment_object["status"] = "completed"
        set_redis_cache(f"assignment_{assignment.id}", assignment_object)
        # we can remove the assignment specific folder from the tmp directory at thsi point, skipping for now
    
    return json_data

# dummy function of `give_feedback` using time sleep for faster debugging
def give_feedback_dummy(db: db_dependency, submission_id: str):
    # first we get the corresponding submission
    submission = db.query(models.Submissions).filter(models.Submissions.id == submission_id).first()
    if submission is None:
        return {"error": "Submission not found"}

    # then we get the corresponding assignment
    assignment = db.query(models.Assignments).filter(models.Assignments.id == submission.assignment_id).first()

    # update status of the submission object inside the above to processing
    assignment_object = get_redis_cache(f"assignment_{assignment.id}")
    for sub in assignment_object["submissions"]:
        if sub["id"] == submission.id:
            sub["status"] = "processing"
            break
    set_redis_cache(f"assignment_{assignment.id}", assignment_object)

    time.sleep(30)
    
    # update status of the submission object inside the above to completed
    assignment_object = get_redis_cache(f"assignment_{assignment.id}")
    for sub in assignment_object["submissions"]:
        if sub["id"] == submission.id:
            sub["status"] = "completed"
            break
    set_redis_cache(f"assignment_{assignment.id}", assignment_object)

    # check if this is the last submission for this assignment
    # if yes, then update the status of the assignment object to completed
    assignment_object = get_redis_cache(f"assignment_{assignment.id}")
    if all(sub["status"] == "completed" for sub in assignment_object["submissions"]):
        assignment_object["status"] = "completed"
        set_redis_cache(f"assignment_{assignment.id}", assignment_object)

def queue_feedback(db: db_dependency, assignment_id: str, background_tasks: BackgroundTasks): 
    """ Takes a assignment id and queues the feedback generation process for all the submissions """
    # checking if the assignment id is valid
    assignment = db.query(models.Assignments).filter(models.Assignments.id == assignment_id).first()
    if assignment is None:
        return {"error": "Assignment not found"}
    # checking if the assignment has submissions
    submissions = db.query(models.Submissions).filter(models.Submissions.assignment_id == assignment_id).all()
    if len(submissions) == 0:
        return {"error": "No submissions found for this assignment"}
    
    # add task to redis cache
    assignment_object = get_redis_cache(f"assignment_{assignment_id}")
    assignment_object["status"] = "processing"
    set_redis_cache(f"assignment_{assignment_id}", assignment_object, expiration=-1)

    # add the submission ids to the background tasks
    for submission in submissions:
        # check if the feedback is already generated
        if submission.feedback is not None:
            continue
        # find the user who submitted the assignment
        student = db.query(models.User).filter(models.User.id == submission.student_id).first()
        assignment_object = get_redis_cache(f"assignment_{assignment_id}")
        submission_obj = {
            "id": submission.id,
            "student_name": student.name,
            "status": "pending"
        }
        assignment_object["submissions"].append(submission_obj)
        set_redis_cache(f"assignment_{assignment_id}", assignment_object, expiration=-1)
        background_tasks.add_task(give_feedback, db, submission.id)
    

@router.post("/automated_feedback")
def queue_feedback_tasks(db: db_dependency, user:user_dependency, background_tasks:BackgroundTasks, assignment_id: str = Form(...)):
    """ Takes a assignment id and queues the feedback generation process for all the submissions
    for that assignment. The task is queued in the background and a task id (which is simply the assignment id in this case)
    is returned to the user. The task id can be used to check the status of the task.
    """
    # checking if the user is a teacher
    if user.is_teacher == False:
        return {"error": "You are not authorized to perform this action"}
    # checking if the user is a teacher for the class which the assignment belongs to
    assignment = db.query(models.Assignments).filter(models.Assignments.id == assignment_id).first()
    if assignment is None:
        return {"error": "Assignment not found"}
    class_id = assignment.class_id

    assignment_class = db.query(models.Classes).filter(models.Classes.id == class_id).first()

    if assignment_class.teacher_id != user.id:
        return {"error": "You are not authorized to perform this action"}

    # check if the assignment processing is already in progress or completed
    assignment_object = get_redis_cache(f"assignment_{assignment_id}")
    if assignment_object is not None and assignment_object["status"] != "pending":
        if assignment_object["status"] == "processing":
            return {"error": "Feedback generation process is already in progress"}
        elif assignment_object["status"] == "completed":
            return {"error": "Feedback generation for this assignment is already complete"}

    assignment_object = {
        "status": "pending",
        "submissions": []
    }
    set_redis_cache(f"assignment_{assignment_id}", assignment_object, expiration=-1)
    queue_feedback(db,assignment_id,background_tasks)
    return {"message": "Feedback generation process started", "assignment_id": assignment_id}

@router.get("/feedback_status")
def get_feedback_status(db: db_dependency, user:user_dependency,assignment_id: str):
    """ Returns the status of the feedback generation process for the given assignment id.
    Can be accessed by either a teacher or a student belonging to the class.
    """
    class_id = db.query(models.Assignments).filter(models.Assignments.id == assignment_id).first().class_id
    # checking if the user is a teacher
    if user.is_teacher == False:
        # checking if the user is a student for the class which the assignment belongs to
        class_student = db.query(models.Class_Students).filter(models.Class_Students.class_id == class_id, models.Class_Students.student_id == user.id).first()
        if class_student is None:
            return {"error": "You are not authorized to perform this action"}
    elif user.is_teacher == True:
        # checking if the user is a teacher for the class which the assignment belongs to
        class_assigment = db.query(models.Classes).filter(models.Classes.id == class_id).first()
        if class_assigment.teacher_id != user.id:
            return {"error": "You are not authorized to perform this action"}
    # checking if the user is a teacher for the class which the assignment belongs to
    assignment_object = get_redis_cache(f"assignment_{assignment_id}")
    ttl = redis_client.ttl(f"assignment_{assignment_id}")
    if assignment_object is None:
        return {"error": "Either the assignment id is invalid or the feedback generation process has not started yet"}
    return assignment_object

@router.get("/feedback")
def get_feedback(db: db_dependency, user:user_dependency, submission_id: str):
    """ Returns the feedback for the given submission id.
    Can be accessed by either a teacher or a student belonging to the class.
    """
    # checking if the user is a teacher
    if user.is_teacher == False:
        # checking if the user is the one who submitted the assignment
        submission = db.query(models.Submissions).filter(models.Submissions.id == submission_id).first()
        if submission is None:
            return {"error": "Submission not found"}
        if submission.student_id != user.id:
            return {"error": "You are not authorized to perform this action"}
    elif user.is_teacher == True:
        # checking if the user is a teacher for the class which the assignment belongs to
        submission = db.query(models.Submissions).filter(models.Submissions.id == submission_id).first()
        if submission is None:
            return {"error": "Submission not found"}
        assignment = db.query(models.Assignments).filter(models.Assignments.id == submission.assignment_id).first()
        class_id = assignment.class_id
        class_assigment = db.query(models.Classes).filter(models.Classes.id == class_id).first()
        if class_assigment.teacher_id != user.id:
            return {"error": "You are not authorized to perform this action"}

    # checking if the feedback has been generated
    if submission.feedback is None:
        return {"error": "Feedback has not been generated yet"}
    
    feedback = json.loads(submission.feedback)
    return feedback