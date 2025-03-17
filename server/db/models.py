from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from .database import Base
import uuid
import base64

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    password = Column(String)
    is_teacher = Column(Boolean, default=False)
    profile_pic = Column(String)

class Teachers(Base):
    __tablename__ = 'teachers'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    class_id = Column(String(6), ForeignKey('classes.id'))

class Students(Base):
    __tablename__ = 'students'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    class_id = Column(String(6), ForeignKey('classes.id'))
    submissions_id = Column(Integer, ForeignKey('submissions.id'))


def generate_uuid_code():
    return base64.urlsafe_b64encode(uuid.uuid4().bytes).decode()[:6]

class Classes(Base):
    __tablename__ = 'classes'

    id = Column(String(6), primary_key=True, unique=True, index=True, default=generate_uuid_code)
    class_name = Column(String)
    class_description = Column(String)
    teacher_id = Column(Integer, ForeignKey('teachers.id'))
    students_id = Column(Integer,ForeignKey('students.id'))    
    assignments_id = Column(Integer, ForeignKey('assignments.id'))

class Assignments(Base):
    __tablename__ = 'assignments'

    id = Column(Integer, primary_key=True, index=True)
    assignment_name = Column(String)
    assignment_description = Column(String)
    assignment_deadline = Column(DateTime)
    assignment_file = Column(String)
    key_answer = Column(String)
    class_id = Column(String(6), ForeignKey('classes.id'))

class Submissions(Base):
    __tablename__ = 'submissions'

    id = Column(Integer, primary_key=True, index=True)
    submission_file = Column(String)
    submission_date = Column(DateTime)
    student_id = Column(Integer, ForeignKey('students.id'))
    assignment_id = Column(Integer, ForeignKey('assignments.id'))  