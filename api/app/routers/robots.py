import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..dependencies import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/robots", tags=["Robots"])


@router.post("/", response_model=schemas.RobotResponse)
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


@router.get("/", response_model=list[schemas.RobotResponse])
def get_robots(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Robot).offset(skip).limit(limit).all()


@router.put("/{robot_id}", response_model=schemas.RobotResponse)
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


@router.delete("/{robot_id}")
def delete_robot(robot_id: int, db: Session = Depends(get_db)):
    db_robot = db.query(models.Robot).filter(models.Robot.id == robot_id).first()
    if not db_robot:
        raise HTTPException(status_code=404, detail="Robot not found")

    db.delete(db_robot)
    db.commit()
    return {"detail": "Robot deleted successfully"}
