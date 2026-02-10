from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
import models
from auth import hash_password, verify_password, create_token
from schemas import UserCreate

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = models.User(
        email=user.email,
        password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    return {"message": "Registered successfully"}

@app.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({"sub": db_user.email})
    return {"access_token": token}

from pydantic import BaseModel

class TaskCreate(BaseModel):
    title: str


@app.get("/tasks")
def get_tasks(db: Session = Depends(get_db)):
    return db.query(models.Task).all()


@app.post("/tasks")
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    new_task = models.Task(title=task.title)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task