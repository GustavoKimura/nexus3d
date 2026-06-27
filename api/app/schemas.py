from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional


class ScanLogBase(BaseModel):
    point_count: int
    has_anomaly: bool
    ai_report: Optional[str] = None


class ScanLogCreate(ScanLogBase):
    robot_id: int


class ScanLogResponse(ScanLogBase):
    id: int
    robot_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RobotBase(BaseModel):
    name: str
    status: str
    location: str


class RobotCreate(RobotBase):
    pass


class RobotUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None


class RobotResponse(RobotBase):
    id: int
    scan_logs: List[ScanLogResponse] = []

    model_config = ConfigDict(from_attributes=True)
