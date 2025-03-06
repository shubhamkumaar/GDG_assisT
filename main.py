from typing import Union, Annotated

from fastapi import FastAPI, Form
from pydantic import BaseModel

from google import genai
app = FastAPI()

class FormData(BaseModel):
    question: str
    answer: str
    keypoints: str


client = genai.Client(api_key="AIzaSyDgvlSJhycReSgKvcliOz4gowGnRJwouvs")

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.post("/feedback")
def give_feedback(data: Annotated[FormData, Form()]):

    prompt = f"""I am sharing you a question and the answer given by the student.

And the key points by teacher to be there in the answer.

Give me a short feedback directly without any greeting or introduction.
Don't give me the answer i only need feedback as you are telling this to a student.

Question: {data.question}
Answer given by student: {data.answer}
Key points by teacher: {data.keypoints}
"""
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )
    print(data)
    print(response.text)
    return response.text
