from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, ARRAY, Time, Numeric, Date, DateTime, PrimaryKeyConstraint
from datetime import datetime, timedelta
from .database import Base
import uuid
import base64

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    phone = Column(String)
    password = Column(String)
    is_teacher = Column(Boolean, default=False)
    profile_pic = Column(String)

def generate_uuid_code():
    return base64.urlsafe_b64encode(uuid.uuid4().bytes).decode()[:6]

class Classes(Base):
    __tablename__ = 'classes'

    id = Column(String(6), primary_key=True, unique=True, index=True, default=generate_uuid_code)
    class_name = Column(String, nullable=False)
    teacher_id = Column(Integer, ForeignKey('users.id'))   
    syllabus = Column(String)
    days_of_week = Column(ARRAY(String))
    start_time = Column(Time)
    last_instuction_day = Column(Date)

# Sets default deadline to 7 days from now
def default_deadline():
    return datetime.utcnow() + timedelta(days=7)

class Assignments(Base):
    __tablename__ = 'assignments'

    id = Column(Integer, primary_key=True, index=True, unique=True)
    assignment_name = Column(String, nullable=False)
    assignment_description = Column(String)
    assignment_deadline = Column(DateTime, nullable=False, default=default_deadline)
    assignment_file = Column(String)
    answer_key = Column(String)
    class_id = Column(String(6), ForeignKey('classes.id'))

class Submissions(Base):
    __tablename__ = 'submissions'

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey('assignments.id'))  
    submission_file = Column(String)
    submission_time = Column(DateTime, default=datetime.now)
    student_id = Column(Integer, ForeignKey('users.id'))
    marks = Column(Numeric(5,2))
    feedback = Column(String)

class Class_Students(Base):
    __tablename__ = 'class_students'

    class_id = Column(String(6), ForeignKey('classes.id'))
    student_id = Column(Integer, ForeignKey('users.id'))    

    __table_args__ = (
        PrimaryKeyConstraint('class_id', 'student_id', name='class_students_pk'),
    )