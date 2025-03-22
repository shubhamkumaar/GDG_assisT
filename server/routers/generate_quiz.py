import base64
import os
from google import genai
from google.genai import types
from fastapi import APIRouter
from functools import lru_cache
from server import config

router = APIRouter()

@lru_cache
def get_settings():
    return config.Settings()

Settings = get_settings()

gemini_api_key = Settings.GENAI_API_KEY
# genai.configure(api_key=gemini_api_key)

def generate(amount:int=10):
    print(amount)
    client = genai.Client(
        api_key=gemini_api_key,
    )

    files = [
        # Make the file available in local system working directory
        # client.files.upload(file="AWS BEANSTALK.pdf"),
        # Make the file available in local system working directory
        
        client.files.upload(file="server/public/Performance _metrices.pdf"),
    ]
    model = "gemini-2.0-flash"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_uri(
                    file_uri=files[0].uri,
                    mime_type=files[0].mime_type,
                ),
                # types.Part.from_uri(
                #     file_uri=files[1].uri,
                #     mime_type=files[1].mime_type,
                # ),
                types.Part.from_text(text=f"""I am sharing some study material please make a {amount}-question quiz with the options from that material

Don't include any messages like

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
        temperature=2,
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
async def generate_quiz():
    res = generate(5)
    return {"message": "Quiz generated successfully", "status": 200, "res":res}