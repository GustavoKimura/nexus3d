from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app, get_db
from app.database import Base

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


def test_create_robot_success():
    response = client.post(
        "/robots", json={"name": "TestBot", "status": "online", "location": "Lab Test"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "TestBot"
    assert "id" in data


def test_create_robot_invalid_data():
    response = client.post("/robots", json={"name": "TestBot"})
    assert response.status_code == 422


def test_api_initial_state():
    response = client.get("/docs")
    assert response.status_code == 200
