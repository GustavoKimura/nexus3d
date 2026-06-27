import os
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas
from .database import engine, SessionLocal


def aws_service_upload(file: UploadFile) -> str:
    bucket = os.getenv("AWS_BUCKET_NAME", "nexus3d-scans")
    file_key = f"scans/{uuid.uuid4()}_{file.filename}"
    return f"https://{bucket}.s3.amazonaws.com/{file_key}"


def cloud_proc_analyze(data: bytes) -> dict:
    return {"point_count": 250000, "has_anomaly": True}


def ai_service_generate_report(analysis_data: dict) -> str:
    return f"Laudo IA: Análise concluída. Dados: {analysis_data}"


@asynccontextmanager
async def lifespan(app: FastAPI):
    models.Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Nexus3D API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


@app.post("/robots", response_model=schemas.RobotResponse)
def create_robot(robot: schemas.RobotCreate, db: Session = Depends(get_db)):
    db_robot = models.Robot(
        name=robot.name, status=robot.status, location=robot.location
    )
    db.add(db_robot)
    db.commit()
    db.refresh(db_robot)
    return db_robot


@app.post("/scans/process/{robot_id}", response_model=schemas.ScanLogResponse)
def process_scan(
    robot_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)
):
    robot = db.query(models.Robot).filter(models.Robot.id == robot_id).first()
    if not robot:
        raise HTTPException(status_code=404, detail="Robot not found")

    s3_url = aws_service_upload(file)

    analysis = cloud_proc_analyze(b"mocked point cloud data")

    report = ai_service_generate_report(analysis)

    db_scan = models.ScanLog(
        robot_id=robot_id,
        point_count=analysis["point_count"],
        has_anomaly=analysis["has_anomaly"],
        s3_file_url=s3_url,
    )

    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)

    return db_scan
