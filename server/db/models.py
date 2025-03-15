from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from .database import Base

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
    registration_number = Column(String,unique=True)
    class_id = Column(Integer, ForeignKey('classes.id'))

class Students(Base):
    __tablename__ = 'students'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    registration_number = Column(String,unique=True)
    class_id = Column(Integer, ForeignKey('classes.id'))
    submissions_id = Column(Integer, ForeignKey('submissions.id'))

class Classes(Base):
    __tablename__ = 'classes'

    id = Column(Integer, primary_key=True, index=True)
    class_name = Column(String)
    class_code = Column(String,unique=True)
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
    class_id = Column(Integer, ForeignKey('classes.id'))

class Submissions(Base):
    __tablename__ = 'submissions'

    id = Column(Integer, primary_key=True, index=True)
    submission_file = Column(String)
    submission_date = Column(DateTime)
    student_id = Column(Integer, ForeignKey('students.id'))
    assignment_id = Column(Integer, ForeignKey('assignments.id'))    