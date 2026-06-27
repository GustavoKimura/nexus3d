import os
import math
import tempfile
import random
import logging
from contextlib import asynccontextmanager
from fastapi import (
    FastAPI,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException,
    BackgroundTasks,
)
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas
from .database import engine, SessionLocal
from .services.cloud_proc import process_point_cloud
from .services.ai_service import generate_technical_report

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


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


def cleanup_temp_file(path: str):
    try:
        os.remove(path)
    except Exception:
        pass


@app.get("/sample")
def get_sample_file(background_tasks: BackgroundTasks):
    fd, temp_path = tempfile.mkstemp(suffix=".xyz")
    num_points = 100000
    shape_type = random.choice(["sphere", "torus", "cube"])

    with os.fdopen(fd, "w") as f:
        for _ in range(num_points):
            if shape_type == "sphere":
                theta = random.uniform(0, 2 * math.pi)
                phi = math.acos(random.uniform(-1.0, 1.0))
                r = random.gauss(5.0, 0.03)
                x = r * math.sin(phi) * math.cos(theta)
                y = r * math.sin(phi) * math.sin(theta)
                z = r * math.cos(phi)
            elif shape_type == "torus":
                u = random.uniform(0, 2 * math.pi)
                v = random.uniform(0, 2 * math.pi)
                major_r = 3.0
                minor_r = random.gauss(1.0, 0.03)
                x = (major_r + minor_r * math.cos(v)) * math.cos(u)
                y = (major_r + minor_r * math.cos(v)) * math.sin(u)
                z = minor_r * math.sin(v)
            else:
                face = random.randint(0, 5)
                u = random.uniform(-3.0, 3.0)
                v = random.uniform(-3.0, 3.0)
                n = random.gauss(3.0, 0.03)
                if face == 0:
                    x, y, z = n, u, v
                elif face == 1:
                    x, y, z = -n, u, v
                elif face == 2:
                    x, y, z = u, n, v
                elif face == 3:
                    x, y, z = u, -n, v
                elif face == 4:
                    x, y, z = u, v, n
                else:
                    x, y, z = u, v, -n

            f.write(f"{x:.4f} {y:.4f} {z:.4f}\n")

    background_tasks.add_task(cleanup_temp_file, temp_path)
    return FileResponse(
        path=temp_path, filename=f"generated_{shape_type}.xyz", media_type="text/plain"
    )


@app.post("/robots", response_model=schemas.RobotResponse)
def create_robot(robot: schemas.RobotCreate, db: Session = Depends(get_db)):
    try:
        db_robot = models.Robot(
            name=robot.name, status=robot.status, location=robot.location
        )
        db.add(db_robot)
        db.commit()
        db.refresh(db_robot)
        return db_robot
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating robot: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/robots", response_model=list[schemas.RobotResponse])
def get_robots(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    robots = db.query(models.Robot).offset(skip).limit(limit).all()
    return robots


@app.put("/robots/{robot_id}", response_model=schemas.RobotResponse)
def update_robot(
    robot_id: int, robot: schemas.RobotUpdate, db: Session = Depends(get_db)
):
    db_robot = db.query(models.Robot).filter(models.Robot.id == robot_id).first()
    if not db_robot:
        raise HTTPException(status_code=404, detail="Robot not found")

    if robot.name is not None:
        setattr(db_robot, "name", robot.name)
    if robot.status is not None:
        setattr(db_robot, "status", robot.status)
    if robot.location is not None:
        setattr(db_robot, "location", robot.location)

    db.commit()
    db.refresh(db_robot)
    return db_robot


@app.delete("/robots/{robot_id}")
def delete_robot(robot_id: int, db: Session = Depends(get_db)):
    db_robot = db.query(models.Robot).filter(models.Robot.id == robot_id).first()
    if not db_robot:
        raise HTTPException(status_code=404, detail="Robot not found")

    db.delete(db_robot)
    db.commit()
    return {"detail": "Robot deleted successfully"}


@app.post("/scans/process/{robot_id}", response_model=schemas.ScanLogResponse)
def process_scan(
    robot_id: int,
    file: UploadFile = File(...),
    language: str = Form("en"),
    db: Session = Depends(get_db),
):
    try:
        robot = db.query(models.Robot).filter(models.Robot.id == robot_id).first()
        if not robot:
            raise HTTPException(status_code=404, detail="Robot not found")

        file_content = file.file.read()

        lines = file_content.decode("utf-8", errors="ignore").splitlines()
        points = []
        for line in lines:
            parts = line.strip().split()
            if len(parts) >= 3:
                try:
                    points.append([float(parts[0]), float(parts[1]), float(parts[2])])
                except ValueError:
                    pass

        analysis = process_point_cloud(points)

        report = generate_technical_report(
            original_count=len(points),
            valid_count=analysis["valid_points_count"],
            density=analysis["density"],
            bounding_box=analysis["limits"],
            language=language,
        )
        logger.info(f"AI Report Generated: {report}")

        db_scan = models.ScanLog(
            robot_id=robot_id,
            point_count=analysis["valid_points_count"],
            has_anomaly=analysis["anomaly_detected"],
            ai_report=report,
        )

        db.add(db_scan)
        db.commit()
        db.refresh(db_scan)

        return db_scan
    except Exception as e:
        db.rollback()
        logger.error(f"Error processing scan: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
