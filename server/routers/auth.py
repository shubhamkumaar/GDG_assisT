from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from server.db.database import engine, get_db
import server.db.models as models
from sqlalchemy.orm import Session
from typing import List, Annotated
from datetime import datetime, timedelta
from functools import lru_cache
from server import config
from jose import jwt,JWTError
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request
from starlette.responses import RedirectResponse

router = APIRouter()

@lru_cache
def get_settings():
    return config.Settings()

Settings = get_settings()

"""Loads the Enviorment Variables"""
SECRET_KEY = Settings.SECRET_KEY
ALGORITHM = Settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = Settings.ACCESS_TOKEN_EXPIRE_MINUTES
GOOGLE_CLIENT_ID=Settings.GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=Settings.GOOGLE_CLIENT_SECRET

oauth = OAuth()

oauth.register(name="google",
               client_id=GOOGLE_CLIENT_ID,
               client_secret=GOOGLE_CLIENT_SECRET,
               authorize_url="https://accounts.google.com/o/oauth2/auth",
               access_token_url="https://oauth2.googleapis.com/token",
                userinfo_endpoint="https://www.googleapis.com/oauth2/v3/userinfo",
               authorize_params={"scope": "openid email profile"},
               jwks_uri="https://www.googleapis.com/oauth2/v3/certs",  # Explicitly set JWKS URI
               client_kwargs={"scope": "openid email profile"},
               )

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="login")

class User(BaseModel):
    """Creates the base User Model"""
    name: str
    email : str = None
    phone : str = None
    is_teacher: bool = False
    password: str

class Token(BaseModel):
    """Creates the base Token Model"""
    access_token: str
    token_type: str


# DB Models
models.Base.metadata.create_all(bind=engine)

db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/auth/signup",status_code=status.HTTP_201_CREATED)
async def create_user(user: User,db: db_dependency):
    
    """This function merely registers the user with their email and password.It does this by checking if the user's email already existes in the database and if it exists raises an HTTP Exception. and does it again for phone number and then create a document with name email phone is_teacher and the password which is encrypted adds it to the database commits it and refresh the user.and if the boolean for is teacher is true then adds the relationship in Teachers and Students Relationship Table based on what it implies after commiting it into the database it then creates A template JSON response by first making a json response called content which is just the parameters sent by user minus password and converts into A JSONResponse and sets cookies for the values as such and creates the accesss token and sends back the response with access token and JSON Response"""

    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    # print(db_user)
    if db_user :
        raise HTTPException(
            status_code = status.HTTP_405_METHOD_NOT_ALLOWED,
            detail = "Email already exists",
            headers={"WWW-Authenticate": "Bearer"}
        ) 
    db_user = db.query(models.User).filter(models.User.phone == user.phone).first()
    if db_user :
        raise HTTPException(
            status_code = status.HTTP_405_METHOD_NOT_ALLOWED,
            detail = "Phone number already exists",
            headers={"WWW-Authenticate": "Bearer"}
        )
    db_user = models.User(
        name = user.name,
        email = user.email.lower(),
        phone = user.phone,
        is_teacher = user.is_teacher,
        password=bcrypt_context.hash(user.password)
    )
    try:
            
        db.add(db_user)    
        db.commit()
        db.refresh(db_user)
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code = status.HTTP_405_METHOD_NOT_ALLOWED,
            detail = "Error in creating user",
            headers={"WWW-Authenticate": "Bearer"}
        )
    content = {"name": db_user.name, "email": db_user.email, "phone": db_user.phone, "is_teacher": db_user.is_teacher}
    response = JSONResponse(content=content)
    response.set_cookie(key="user_id", value=str(db_user.id))
    response.set_cookie(key="user_name", value=db_user.name)
    response.set_cookie(key="user_email", value=db_user.email)
    response.set_cookie(key="user_phone", value=db_user.phone)
    response.set_cookie(key="is_teacher", value=db_user.is_teacher)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        db_user.email,db_user.id, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/auth/login", response_model=Token)
async def login_for_access_token(form_data:Annotated[OAuth2PasswordRequestForm,Depends()],db: db_dependency):
    """The user is authenticated to check if he exists in the database or not if thier is no user found an exception is raised an access token is created for user session and the corresponding object is returned"""
    user = authenticate_user(form_data.username, form_data.password,db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        user.email,user.id, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

def authenticate_user(email: str, password: str,db: db_dependency):
    """This function is used to check if the user exists in the database or not.The user is queried from the database if no user found it return false if a user was the found the sent password is verified with saved password in database using bcrypt_context and return the user finally"""
    user = db.query(models.User).filter(models.User.email == email.lower()).first()
    if not user:
        return False
    if not bcrypt_context.verify(password, user.password):
        return False
    return user

def create_access_token(email:str,user_id:int, expires_delta: timedelta):

    """The create access token creates a token which would be the time limit the current user is active and when this session expires first create a encode object which is email and id and expires object which is current time + object expire time adds it into the encode object and return jwt encoded encode object with The secret Key and Algorithm"""

    encode = {'sub': email, 'id': user_id}
    expires = datetime.utcnow() + expires_delta
    encode.update({"exp": expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_jwt_token(token: Annotated[str,Depends(oauth2_bearer)],db: db_dependency):

    """This is used for in protected routes for getting the current user using the JSON Web Token which was sent under the try catch block,the payload is decoded using the jwt decode from then the user is queried fronm the database to seee if it exists and if it dosent an exception is raised and if their was error in Decoding JWT another HTTPexception is raised and if there were no errors the current user is returned"""

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # print(username)
        user = db.query(models.User).filter(models.User.email == payload.get('sub')).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials") 



# Verify the routes below using   
# http://localhost:8000/auth/google/login
# Changed it to get for testing
@router.get("/auth/google/login")
async def google_login(request: Request):
    """Redirects the user to Google Authentication"""
    return await oauth.google.authorize_redirect(request,config.GOOGLE_REDIRECT_URI)

# Changed it to get for testing
@router.get("/auth/google/callback")
async def google_callback(request: Request,db: db_dependency):
    """this handles the google Oauth callback and generates the jwt. tbis does by first authorizing the request object and then getting the user info by parsing the id token then query for the user in database if the user is not in database add it then create the access token and return it"""
    
    token = await oauth.google.authorize_access_token(request)

    
    # user_info = await oauth.google.parse_id_token(request,token)
    user_info = token['userinfo']
    print(user_info)

    email = user_info["email"]
    name = user_info["name"]

    user = db.query(models.User).filter(User.email == email).first()

    if not user:
        db_user = models.User(
            name = user.name,
            email = user.email,
            phone = user.phone,
            is_teacher = user.is_teacher,
            password=bcrypt_context.hash(user.password)
        )
        try:
                
            db.add(db_user)    
            db.commit()
            db.refresh(db_user)
        except Exception as e:
            print(e)
            raise HTTPException(
                status_code = status.HTTP_405_METHOD_NOT_ALLOWED,
                detail = "Error in creating user",
                headers={"WWW-Authenticate": "Bearer"}
            )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        email, user.id, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user_info, "message": "The route is succesfully implemented"}

@router.post("/protected")
async def protected_route(user: dict = Depends(verify_jwt_token)):
    return {"Message": "you have access","user": user}