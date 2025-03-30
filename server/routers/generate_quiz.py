import os
from google import genai
from google.genai import types
from fastapi import APIRouter, HTTPException, Depends,Form, status
from functools import lru_cache
from server import config
from pptx2md import convert, ConversionConfig
from pathlib import Path
from sqlalchemy.orm import Session
from server.db.database import get_db
from typing import Annotated
import server.db.models as models
from server.routers.auth import verify_jwt_token
import requests
from urllib.parse import urlparse

router = APIRouter()

@lru_cache
def get_settings():
    return config.Settings()

Settings = get_settings()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[models.User, Depends(verify_jwt_token)]

gemini_api_key = Settings.GENAI_API_KEY
# genai.configure(api_key=gemini_api_key)

# Generate a quiz from the provided study material
def generate(amount:int=10,file_names=list[str]):
    client = genai.Client(
        api_key=gemini_api_key,
    )
    
    # upload the pdf file to gemini
    files = [
        client.files.upload(file=file_name) for file_name in file_names
    ]
    
    # Attach the files when creating the prompt content
    part = [types.Part.from_uri(
      file_uri=files[i].uri,
      mime_type=files[i].mime_type,
      )for i in range(len(files))]
    
    model = "gemini-2.0-flash"
    
    contents = [
        types.Content(
            role="user",
            parts= part + [
                types.Part.from_text(text=f"""I am sharing some study material please make a {amount}-question quiz with the options from that material
From the resources provided, equally distribute the questions from all the resources.
Don't include any messages like greetings or introduction. Just provide the quiz in JSON format.
Also ignore these types of messages in the response:-
- Okay, here's a 20-question quiz based on the provided material:
- I cannot generate 20 questions. I can only do 10 questions.

Condition to generate the response
- You mustn't include any greetings or an introduction. the only response I need is the JSON.
- Always give me the response in JSON format only.
- The Trailling comma should be removed from all the options and question of the options list as well as question list.
- The Trailling comma should be removed from the last option of the options list.                               
- The Trailling comma should be removed from the last question of the quiz list.
                                                                          
The response should be in JSON format, like
{{ \"quiz\":[
{{
\"question\": \"question\",
\"options\": {{
\"a\": \"Option A\",
\"b\": \"Option B\",
\"c\": \"Option C\",
\"d\": \"Option D\"
}},
\"answer\": \"Option x\"
}},
]
}}"""),
            ],
        ),
        types.Content(
            role="model",
            parts=[
                types.Part.from_text(text="""{
  \"quiz\": [
    {
      \"question\": \"What type of service is AWS Elastic Beanstalk?\",
      \"options\": {
        \"a\": \"Infrastructure as a Service (IAAS)\",
        \"b\": \"Platform as a Service (PAAS)\",
        \"c\": \"Software as a Service (SAAS)\",
        \"d\": \"Function as a Service (FAAS)\"
      },
      \"answer\": \"b\"
    },
    {
      \"question\": \"What does Elastic Beanstalk automatically provision and deploy?\",
      \"options\": {
        \"a\": \"Only EC2 instances\",
        \"b\": \"Only databases\",
        \"c\": \"Required resources to run a web application within AWS\",
        \"d\": \"Only networking components\"
      },
      \"answer\": \"c\"
    },
    {
      \"question\": \"Can developers customize the configuration of resources in Elastic Beanstalk?\",
      \"options\": {
        \"a\": \"No, Elastic Beanstalk restricts all configuration changes\",
        \"b\": \"Yes, developers have complete control over all configurations\",
        \"c\": \"Yes, but only through AWS support\",
        \"d\": \"Yes, but at no level will it restrict the developers from changing any configurations.\"
      },
      \"answer\": \"d\"
    },
    {
      \"question\": \"What is the first step when using Elastic Beanstalk to deploy an application?\",
      \"options\": {
        \"a\": \"Configure the environment\",
        \"b\": \"Deploy the application code\",
        \"c\": \"Create an application and select an environment\",
        \"d\": \"Select the AWS region\"
      },
      \"answer\": \"c\"
    },
    {
      \"question\": \"Which of the following programming languages are supported by Elastic Beanstalk?\",
      \"options\": {
        \"a\": \"COBOL\",
        \"b\": \"FORTRAN\",
        \"c\": \"Java\",
        \"d\": \"Pascal\"
      },
      \"answer\": \"c\"
    },
    {
      \"question\": \"Which application server is provided by Elastic Beanstalk?\",
      \"options\": {
        \"a\": \"IIS\",
        \"b\": \"Tomcat\",
        \"c\": \"WebSphere\",
        \"d\": \"WebLogic\"
      },
      \"answer\": \"b\"
    },
    {
      \"question\": \"What does Elastic Beanstalk offer to simplify application deployment?\",
      \"options\": {
        \"a\": \"Preconfigured runtime-like environments and deployment tools\",
        \"b\": \"Automatic database backups\",
        \"c\": \"Built-in DDOS protection\",
        \"d\": \"Automated code reviews\"
      },
      \"answer\": \"a\"
    },
    {
      \"question\": \"How does Elastic Beanstalk handle application scaling?\",
      \"options\": {
        \"a\": \"Manually configured by the user\",
        \"b\": \"Automatic through auto-scaling rules\",
        \"c\": \"Limited to the size of the initial instance\",
        \"d\": \"Not supported\"
      },
      \"answer\": \"b\"
    },
    {
      \"question\": \"What service is used for access control in Elastic Beanstalk?\",
      \"options\": {
        \"a\": \"AWS IAM\",
        \"b\": \"AWS KMS\",
        \"c\": \"AWS Shield\",
        \"d\": \"AWS WAF\"
      },
      \"answer\": \"a\"
    },
    {
      \"question\": \"What are different types of health check responses that the developer can get?\",
      \"options\": {
        \"a\": \"Good or bad\",
        \"b\": \"Good, bad or moderate\",
        \"c\": \"red, yellow, grey or green\",
        \"d\": \"Healthy or not healthy\"
      },
      \"answer\": \"c\"
    },
    {
      \"question\": \"What is the Application code extension Elastic Beanstalk support?\",
      \"options\": {
        \"a\": \"Doc or pdf\",
        \"b\": \"PPT or Xls\",
        \"c\": \"Only War format\",
        \"d\": \"ZIP or WAR\"
      },
      \"answer\": \"d\"
    },
    {
      \"question\": \"For the environment status code 200 what action is recommended?\",
      \"options\": {
        \"a\": \"Scheduled by the developers to ping the application\",
        \"b\": \"stop service\",
        \"c\": \"Remove the current code\",
        \"d\": \"reboot\"
      },
      \"answer\": \"a\"
    },
    {
      \"question\": \"Is the Load balancing of the instance dynamically scable in Elactic beanstalk\",
      \"options\": {
        \"a\": \"Not supported\",
        \"b\": \"Using Auto-Scaling within Elastic Beanstalk\",
        \"c\": \"Only Static\",
        \"d\": \"manual\"
      },
      \"answer\": \"b\"
    },
    {
      \"question\": \"What Is main function that Route 53 performs\",
      \"options\": {
        \"a\": \"Routing to VPC resources\",
        \"b\": \"Main functions in any combination: domain registration, DNS routing, and health checking\",
        \"c\": \"Check the bandwidth\",
        \"d\": \"routing to EC2 isntances\"
      },
      \"answer\": \"b\"
    },
    {
      \"question\": \"Amazon Web Services provide security through?\",
      \"options\": {
        \"a\": \"Automatic provisioning\",
        \"b\": \"Automatic domain registration\",
        \"c\": \"Automatic scaling\",
        \"d\": \"The correct services and configuring their security groups\"
      },
      \"answer\": \"d\"
    },
    {
      \"question\": \"Tomcat in AWS comes under which type of platform for application\",
      \"options\": {
        \"a\": \"programming\",
        \"b\": \"management\",
        \"c\": \"servers\",
        \"d\": \"client\"
      },
      \"answer\": \"c\"
    },
    {
      \"question\": \"What is the main use of Enviorment heath in Elastic beanstalk\",
      \"options\": {
        \"a\": \"Automatic cloud plafform feature\",
        \"b\": \"Automatic DNS Checks\",
        \"c\": \"Automation check health for cloud platform\",
        \"d\": \"check manual\"
      },
      \"answer\": \"c\"
    },
    {
      \"question\": \"Under AWS Console what step is take deploy application\",
      \"options\": {
        \"a\": \"search the console\",
        \"b\": \"Search Create Application button\",
        \"c\": \"Enter application tag\",
        \"d\": \"Search platform menu and application menu button\"
      },
      \"answer\": \"b\"
    },
    {
      \"question\": \"What service do we require for access control AWS Elastic Beanstalk?\",
      \"options\": {
        \"a\": \"KMS Access control\",
        \"b\": \"SSLAccess control\",
        \"c\": \"AWS Access\",
        \"d\": \"Identity Access Management \"
      },
      \"answer\": \"d\"
    },
    {
      \"question\": \"If website needs an aws resource example, how will register through \",
      \"options\": {
        \"a\": \"Route3\",
        \"b\": \"route12\",
        \"c\": \"ELB12\",
        \"d\": \"AMI service\"
      },
      \"answer\": \"a\"
    }
  ]
}"""),
            ],
        ),
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""INSERT_INPUT_HERE"""),
            ],
        ),
    ]
    
    generate_content_config = types.GenerateContentConfig(
        temperature=0.8,
        top_p=0.95,
        top_k=40,
        max_output_tokens=8192,
        response_mime_type="application/json",
    )
    res = ""
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        print(chunk.text, end="")
        res += chunk.text
    with open("server/public/quiz.json", "w") as f:
        f.write(res)          
    return res


@router.post("/generate_quiz")
async def generate_quiz(user:user_dependency, db: db_dependency, material_ids_string: str = Form(...), class_id:str = Form(...), amount: int = Form(...)):
  # Provide the number of questions and material id as a string separeated by {,}
  
  # Convert the string of material IDs into a list of integers
  material_ids = [int(id.strip()) for id in material_ids_string.split(',')]
  if not material_ids:
      raise HTTPException(status_code=400, detail="Material IDs are required")
  if amount <= 0:
      raise HTTPException(status_code=400, detail="Amount must be greater than 0")
  if not class_id:
      raise HTTPException(status_code=400, detail="Class ID is required")    
      
  # Check if the user is a teacher
  if user.is_teacher != True:
      raise HTTPException(status_code=403, detail="Only teachers can generate quizzes")
      
  # Check if the class_id is valid
  db_class = db.query(models.Classes).filter(models.Classes.id == class_id.strip()).first()
  
  if db_class is None:
      raise HTTPException(status_code=404, detail="Class not found")
    
  # Check if the user is the teacher of the class
  if db_class.teacher_id != user.id:
      raise HTTPException(status_code=403, detail="You are not authorized to generate quizzes for this class")
    
    
  # Check if the materials exist in the database and match the class_id
  materials = (
    db.query(models.Materials.material_file)
    .filter(models.Materials.id.in_(material_ids))
    .filter(models.Materials.class_id == class_id.strip())
    .all()
    )
  if materials is None:
      raise HTTPException(status_code=404, detail="Material not found")
    
  file_url = [material[0] for material in materials]
  files = []
  for url in file_url:
      if not url.startswith("http"):
          raise HTTPException(status_code=400, detail="Invalid URL format")
      response = requests.get(url, stream=True)
      if response.status_code != 200:
          raise HTTPException(status_code=404, detail="File not found")
      
      # Extract the filename from the URL path
      parsed_url = urlparse(url)
      filename = parsed_url.path.split('/')[-1]
      file_path = os.path.join("server/public/", filename)
      
      format = filename.split(".")[-1]
      # Check if the file is a PDF or PPT
      if format not in ["pdf", "ppt", "pptx","txt"]:
          raise HTTPException(status_code=400, detail="Invalid file format. Only PDF and PPT files are supported.")
      
      # Save the file locally
      with open(file_path, 'wb') as file:
          for chunk in response.iter_content(chunk_size=8192):
              file.write(chunk)
      
      # Convert .ppt to .pptx newer version of presentation 
      if format == "ppt":
        os.system(f"libreoffice --headless --convert-to pptx --outdir server/public/ {file_path}")
        os.remove(file_path)
        file_path = file_path.replace(".ppt", ".pptx")
        print(file_path)  
      
        # Convert pptx to md
      output_path = Path(f"server/public/{file_path.split('/')[-1].replace('.pptx', '.md')}")
      if format == "pptx":
        convert(
           ConversionConfig(
               pptx_path=file_path,
               output_path=output_path,
               image_dir="server/public/images",
               disable_image=True
           )
        )
        file_path = output_path
      files.append(file_path)   
  
  print("Amount:", amount)
  res = generate(amount,files)
  
  # Remove the files after processing from server/public
  for file in files:
    os.remove(file)
  return {"message": "Quiz generated successfully", "status": 200, "res":res}  
    