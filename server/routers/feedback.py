from fastapi import Form, APIRouter 
from typing import Annotated
from pydantic import BaseModel
from google import genai
from functools import lru_cache
from server import config

router = APIRouter()

@lru_cache
def get_settings():
    return config.Settings()

Settings = get_settings()
# Taking the question, answer and keypoints as input
class FormData(BaseModel):
    question: str
    answer: str
    keypoints: str

# Creating a client object
client = genai.Client(api_key=Settings.GENAI_API_KEY)

# Endpoint to give feedback
@router.post("/feedback")
def give_feedback(data: Annotated[FormData, Form()]):
# Prompt for the model
    prompt = f"""I am sharing you a question and the answer given by the student.

            And the key points by teacher to be there in the answer.
            
            Give me a short feedback directly without any greeting or introduction.
            Don't give me the answer i only need feedback as you are telling this to a student.
            
            Question: {data.question}
            Answer given by student: {data.answer}
            Key points by teacher: {data.keypoints}
            """
    # Generating the content
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )
    # print(data)
    # print(response.text)
    return response.text