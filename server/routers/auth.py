from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from server.db.database import engine, SessionLocal
import server.db.models as models
from sqlalchemy.orm import Session
from typing import List, Annotated
from datetime import datetime, timedelta, timezone

from jose import jwt,JWTError
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/token")

class User(BaseModel):
    name: str
    email : str = None
    phone : str = None
    is_teacher: bool = False
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str


# DB Models
models.Base.metadata.create_all(bind=engine)

# DB Connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/",status_code=status.HTTP_201_CREATED)
async def create_user(user: User,db: db_dependency):

    db_user = models.User(
        name = user.name,
        email = user.email,
        phone = user.phone,
        is_teacher = user.is_teacher,
        password=bcrypt_context.hash(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    content = {"user": db_user}
    response = JSONResponse(content=content)
    response.set_cookie(key="user_id", value=str(db_user.id))
    response.set_cookie(key="user_name", value=db_user.name)
    response.set_cookie(key="user_email", value=db_user.email)
    response.set_cookie(key="user_phone", value=db_user.phone)
    response.set_cookie(key="is_teacher", value=db_user.is_teacher)
    return response

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data:Annotated[OAuth2PasswordRequestForm,Depends()],db: db_dependency):
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
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return False
    if not bcrypt_context.verify(password, user.password):
        return False
    return user

def create_access_token(email:str,user_id:int, expires_delta: timedelta):    
    encode = {'sub': email, 'id': user_id}
    expires = datetime.utcnow() + expires_delta
    encode.update({"exp": expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: Annotated[str,Depends(oauth2_bearer)],db: db_dependency):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # print(username)
        user = db.query(models.User).filter(models.User.email == payload.get('sub')).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")     