from fastapi import FastAPI,Depends
from typing import Annotated
from .routers import check_answer, feedback, auth, assignment, home, classes, profile, generate_quiz
from starlette.middleware.sessions import SessionMiddleware
import json
# from pptx2md import convert, ConversionConfig
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
import os
# from server.db.database import get_db
# import server.db.models as models
# # from sqlalchemy.orm import Session
# from .routers.auth import verify_jwt_token

app = FastAPI(root_path="/api")

app.add_middleware(SessionMiddleware, secret_key="your_secret_key_here")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://assist.kanishak.me", "https://assist.kanishak.me"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Cross-Origin-Opener-Policy"],
)

app.include_router(feedback.router)
app.include_router(check_answer.router)
app.include_router(auth.router)
app.include_router(home.router)
app.include_router(assignment.router)
app.include_router(classes.router)
app.include_router(profile.router)
app.include_router(generate_quiz.router)
# db_dependency = Annotated[Session, Depends(get_db)]
# user_dependency = Annotated[models.User, Depends(verify_jwt_token)]    

@app.get("/")
def read_root():
   # Remove all the spaces file path
#    file_path = "server/public/pres.ppt"
#    os.system(f"libreoffice --headless --convert-to pptx --outdir server/public/ {file_path}")
#    # os.remove(file_path)
#    file_path = file_path.replace(".ppt", ".pptx")
#    output_path = Path(f"server/public/{file_path.split('/')[-1].replace('.pptx', '.md')}")
#    print(file_path)  
#    convert(
#       ConversionConfig(
#           pptx_path=file_path,
#           output_path=output_path,
#           image_dir="server/public/images",
#           disable_image=True
#       )
#    )
#    return output_path
    return {"message": "Hello World"}
