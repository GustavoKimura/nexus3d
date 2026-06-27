import logging
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..dependencies import get_db
from ..services.cloud_proc import process_point_cloud
from ..services.ai_service import generate_technical_report

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/scans", tags=["Scans"])


@router.post("/process/{robot_id}", response_model=schemas.ScanLogResponse)
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
