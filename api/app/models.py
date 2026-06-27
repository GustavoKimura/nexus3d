from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Robot(Base):
    __tablename__ = "robots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    status = Column(String)
    location = Column(String)

    scan_logs = relationship("ScanLog", back_populates="robot")


class ScanLog(Base):
    __tablename__ = "scan_logs"

    id = Column(Integer, primary_key=True, index=True)
    robot_id = Column(Integer, ForeignKey("robots.id"))
    point_count = Column(Integer)
    has_anomaly = Column(Boolean, default=False)
    s3_file_url = Column(String)
    ai_report = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    robot = relationship("Robot", back_populates="scan_logs")
